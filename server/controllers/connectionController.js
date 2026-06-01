import pool from '../db/pool.js'

// Send a connection request to another player
export async function sendRequest(req, res) {
  const { recipient_username } = req.body

  try {
    // Look up the recipient's ID from their username
    const recipientResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [recipient_username]
    )
    if (recipientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found.' })
    }
    const recipientId = recipientResult.rows[0].id

    if (recipientId === req.user.id) {
      return res.status(400).json({ message: "You can't send a request to yourself." })
    }

    // Check if a connection already exists in either direction
    const existing = await pool.query(
      `SELECT id FROM connections
       WHERE (requester_id = $1 AND recipient_id = $2)
          OR (requester_id = $2 AND recipient_id = $1)`,
      [req.user.id, recipientId]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'A connection request already exists.' })
    }

    const result = await pool.query(
      'INSERT INTO connections (requester_id, recipient_id) VALUES ($1, $2) RETURNING id',
      [req.user.id, recipientId]
    )
    res.status(201).json({ id: result.rows[0].id, message: 'Request sent!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get all connections and requests for the logged-in user
export async function getConnections(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        c.id,
        c.status,
        c.created_at,
        c.requester_id,
        c.recipient_id,
        -- Info about the OTHER person in the connection
        CASE WHEN c.requester_id = $1 THEN u2.username ELSE u1.username END AS other_username,
        CASE WHEN c.requester_id = $1 THEN u2.avatar_url ELSE u1.avatar_url END AS other_avatar,
        CASE WHEN c.requester_id = $1 THEN u2.top_classes ELSE u1.top_classes END AS other_classes,
        CASE WHEN c.requester_id = $1 THEN u2.region ELSE u1.region END AS other_region,
        CASE WHEN c.requester_id = $1 THEN u2.timezone ELSE u1.timezone END AS other_timezone,
        -- Was the current user the one who sent the request?
        CASE WHEN c.requester_id = $1 THEN true ELSE false END AS i_sent
       FROM connections c
       JOIN users u1 ON u1.id = c.requester_id
       JOIN users u2 ON u2.id = c.recipient_id
       WHERE c.requester_id = $1 OR c.recipient_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get count of pending incoming requests (for navbar badge)
export async function getPendingCount(req, res) {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM connections WHERE recipient_id = $1 AND status = 'pending'",
      [req.user.id]
    )
    res.json({ count: parseInt(result.rows[0].count) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get the connection status between the logged-in user and a profile they're viewing
export async function getConnectionStatus(req, res) {
  const { username } = req.params
  try {
    const otherUser = await pool.query('SELECT id FROM users WHERE username = $1', [username])
    if (otherUser.rows.length === 0) return res.json({ status: 'none' })
    const otherId = otherUser.rows[0].id

    const result = await pool.query(
      `SELECT id, status, requester_id FROM connections
       WHERE (requester_id = $1 AND recipient_id = $2)
          OR (requester_id = $2 AND recipient_id = $1)`,
      [req.user.id, otherId]
    )
    if (result.rows.length === 0) return res.json({ status: 'none' })

    const conn = result.rows[0]
    res.json({
      id: conn.id,
      status: conn.status,
      i_sent: conn.requester_id === req.user.id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Accept or decline a request
export async function respondToRequest(req, res) {
  const { id } = req.params
  const { action } = req.body // 'accept' or 'decline'

  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ message: 'Action must be accept or decline.' })
  }

  try {
    // Only the recipient can respond
    const result = await pool.query(
      "UPDATE connections SET status = $1 WHERE id = $2 AND recipient_id = $3 AND status = 'pending' RETURNING id",
      [action === 'accept' ? 'accepted' : 'declined', id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found or already responded to.' })
    }
    res.json({ message: action === 'accept' ? 'Connected!' : 'Request declined.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Remove a connection or cancel a pending request
export async function removeConnection(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      'DELETE FROM connections WHERE id = $1 AND (requester_id = $2 OR recipient_id = $2) RETURNING id',
      [id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Connection not found.' })
    }
    res.json({ message: 'Removed.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
