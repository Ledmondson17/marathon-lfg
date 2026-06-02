import pool from '../db/pool.js'
import { cloudinary, uploadToCloudinary } from '../middleware/upload.js'

// Public columns safe to return to the frontend
const PUBLIC_FIELDS = 'id, username, avatar_url, bio, playstyle, availability, region, timezone, platforms, top_classes, socials, bungie_display_name, bungie_kd, looking_for_salvage, preferred_activity, created_at'

export async function getPlayers(req, res) {
  const { platform, class: cls, search, kd, timezone, salvage, activity } = req.query
  let query = `SELECT ${PUBLIC_FIELDS} FROM users`
  const conditions = []
  const values = []

  if (platform) {
    values.push(platform)
    conditions.push(`$${values.length} = ANY(platforms)`)
  }
  if (cls) {
    values.push(cls)
    conditions.push(`$${values.length} = ANY(top_classes)`)
  }
  if (search) {
    values.push(`%${search}%`)
    conditions.push(`username ILIKE $${values.length}`)
  }
  if (timezone) {
    values.push(timezone)
    conditions.push(`timezone = $${values.length}`)
  }
  if (activity) {
    values.push(activity)
    conditions.push(`preferred_activity = $${values.length}`)
  }
  if (salvage) {
    values.push(salvage)
    conditions.push(`$${values.length} = ANY(looking_for_salvage)`)
  }
  if (kd) {
    // Players with no Bungie account (NULL k/d) are treated as 0-1.0
    if (kd === '0-1.0') {
      conditions.push(`(bungie_kd IS NULL OR bungie_kd <= 1.0)`)
    } else if (kd === '1.1-1.29') {
      conditions.push(`(bungie_kd >= 1.1 AND bungie_kd <= 1.29)`)
    } else if (kd === '1.3-1.69') {
      conditions.push(`(bungie_kd >= 1.3 AND bungie_kd <= 1.69)`)
    } else if (kd === '1.7-1.99') {
      conditions.push(`(bungie_kd >= 1.7 AND bungie_kd <= 1.99)`)
    } else if (kd === '2.0+') {
      conditions.push(`bungie_kd >= 2.0`)
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  query += ' ORDER BY created_at DESC LIMIT 50'

  try {
    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

export async function getProfile(req, res) {
  const { username } = req.params
  try {
    const userResult = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM users WHERE username = $1`,
      [username]
    )
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found.' })
    }
    const user = userResult.rows[0]

    // Attach media uploads
    const mediaResult = await pool.query(
      'SELECT id, url FROM media WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )
    user.media = mediaResult.rows

    // Attach accepted squadmates
    const squadResult = await pool.query(
      `SELECT
        CASE WHEN c.requester_id = $1 THEN u2.username ELSE u1.username END AS username,
        CASE WHEN c.requester_id = $1 THEN u2.avatar_url ELSE u1.avatar_url END AS avatar_url,
        CASE WHEN c.requester_id = $1 THEN u2.top_classes ELSE u1.top_classes END AS top_classes
       FROM connections c
       JOIN users u1 ON u1.id = c.requester_id
       JOIN users u2 ON u2.id = c.recipient_id
       WHERE (c.requester_id = $1 OR c.recipient_id = $1)
         AND c.status = 'accepted'`,
      [user.id]
    )
    user.squadmates = squadResult.rows

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

export async function updateProfile(req, res) {
  const { bio, playstyle, availability, region, timezone, platforms, top_classes, socials, looking_for_salvage, preferred_activity } = req.body

  // Validate top_classes max 3
  if (top_classes && top_classes.length > 3) {
    return res.status(400).json({ message: 'You can only select up to 3 classes.' })
  }

  const VALID_CLASSES = ['Recon', 'Vandal', 'Destroyer', 'Assassin', 'Thief', 'Triage', 'Sentinel']
  if (top_classes && top_classes.some((c) => !VALID_CLASSES.includes(c))) {
    return res.status(400).json({ message: 'Invalid class selection.' })
  }

  try {
    const result = await pool.query(
      `UPDATE users SET
        bio = $1, playstyle = $2, availability = $3, region = $4, timezone = $5,
        platforms = $6, top_classes = $7, socials = $8, looking_for_salvage = $9,
        preferred_activity = $10
       WHERE id = $11
       RETURNING ${PUBLIC_FIELDS}`,
      [bio, playstyle, availability, region, timezone, platforms, top_classes, socials, looking_for_salvage, preferred_activity, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

export async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' })
  }
  try {
    const { url, public_id } = await uploadToCloudinary(req.file.buffer, {
      folder: 'marathon-lfg-avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    })

    // Delete old avatar from Cloudinary if one exists
    const existing = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id])
    const oldUrl = existing.rows[0]?.avatar_url
    if (oldUrl) {
      // Extract public_id from the old Cloudinary URL to delete it
      const parts = oldUrl.split('/')
      const filename = parts[parts.length - 1].split('.')[0]
      const folder = parts[parts.length - 2]
      await cloudinary.uploader.destroy(`${folder}/${filename}`).catch(() => {})
    }

    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [url, req.user.id])
    res.json({ avatar_url: url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

export async function uploadMedia(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' })
  }

  // Limit each user to 10 media items
  const countResult = await pool.query('SELECT COUNT(*) FROM media WHERE user_id = $1', [req.user.id])
  if (parseInt(countResult.rows[0].count) >= 10) {
    return res.status(400).json({ message: 'Maximum of 10 media items allowed.' })
  }

  try {
    const { url, public_id } = await uploadToCloudinary(req.file.buffer)
    const result = await pool.query(
      'INSERT INTO media (user_id, url, public_id) VALUES ($1, $2, $3) RETURNING id, url',
      [req.user.id, url, public_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

export async function deleteMedia(req, res) {
  const { mediaId } = req.params
  try {
    const result = await pool.query(
      'SELECT * FROM media WHERE id = $1 AND user_id = $2',
      [mediaId, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Media not found.' })
    }
    const item = result.rows[0]

    // Remove from Cloudinary first, then our database
    await cloudinary.uploader.destroy(item.public_id)
    await pool.query('DELETE FROM media WHERE id = $1', [mediaId])

    res.json({ message: 'Deleted.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
