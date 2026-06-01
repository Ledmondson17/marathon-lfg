import pool from '../db/pool.js'
import dotenv from 'dotenv'

dotenv.config()

const BUNGIE_API_KEY     = process.env.BUNGIE_API_KEY
const BUNGIE_CLIENT_ID   = process.env.BUNGIE_CLIENT_ID
const BUNGIE_CLIENT_SECRET = process.env.BUNGIE_CLIENT_SECRET
const CLIENT_URL         = process.env.CLIENT_URL || 'http://localhost:5173'

// Standard headers required on every Bungie API request
const bungieHeaders = {
  'X-API-Key': BUNGIE_API_KEY,
  'Content-Type': 'application/json',
}

// Helper — call the Bungie API and return parsed JSON
async function bungieGet(path, accessToken = null) {
  const headers = { ...bungieHeaders }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
  const res = await fetch(`https://www.bungie.net/Platform${path}`, { headers })
  return res.json()
}

// ─── Step 1: redirect user to Bungie's OAuth consent screen ───────────────────
export function initiateBungieOAuth(req, res) {
  // We embed the user's ID in the "state" parameter so we know who to link
  // when Bungie sends them back to our callback URL.
  const state = Buffer.from(String(req.user.id)).toString('base64')

  const params = new URLSearchParams({
    client_id: BUNGIE_CLIENT_ID,
    response_type: 'code',
    state,
  })

  res.redirect(`https://www.bungie.net/en/OAuth/Authorize?${params}`)
}

// ─── Step 2: Bungie calls this after user approves ────────────────────────────
export async function handleBungieCallback(req, res) {
  const { code, state } = req.query

  if (!code || !state) {
    return res.redirect(`${CLIENT_URL}/profile/edit?bungie=error`)
  }

  // Decode the user ID we embedded in state
  const userId = parseInt(Buffer.from(state, 'base64').toString('utf8'))
  if (!userId) {
    return res.redirect(`${CLIENT_URL}/profile/edit?bungie=error`)
  }

  try {
    // Exchange the authorization code for an access token
    const tokenRes = await fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-API-Key': BUNGIE_API_KEY },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: BUNGIE_CLIENT_ID,
        client_secret: BUNGIE_CLIENT_SECRET,
      }),
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return res.redirect(`${CLIENT_URL}/profile/edit?bungie=error`)
    }

    const accessToken  = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresAt    = new Date(Date.now() + tokenData.expires_in * 1000)

    // Get their Bungie memberships (which platforms/games they play)
    const membershipsData = await bungieGet('/User/GetMembershipsForCurrentUser/', accessToken)
    const bungieNetUser   = membershipsData.Response?.bungieNetUser
    const memberships     = membershipsData.Response?.destinyMemberships || []

    // Prefer the primary membership; fall back to first available
    const primary = membershipsData.Response?.primaryMembershipId
      ? memberships.find(m => m.membershipId === membershipsData.Response.primaryMembershipId)
      : memberships[0]

    const membershipId   = primary?.membershipId || bungieNetUser?.membershipId
    const membershipType = primary?.membershipType || 254 // 254 = BungieNet fallback
    const displayName    = bungieNetUser?.uniqueName || bungieNetUser?.displayName || 'Unknown'

    // Try to fetch K/D immediately so it's ready for filtering
    let kd = null
    try {
      const statsData = await bungieGet(
        `/Destiny2/${membershipType}/Account/${membershipId}/Stats/`,
        accessToken
      )
      const kdRaw = statsData.Response?.mergedAllCharacters?.results?.allPvP?.allTime?.killsDeathsRatio?.basic?.value
      if (kdRaw != null) kd = parseFloat(kdRaw.toFixed(2))
    } catch {
      // K/D fetch failed — not critical, just leave it null
    }

    // Save everything to the database
    await pool.query(
      `UPDATE users SET
        bungie_membership_id    = $1,
        bungie_membership_type  = $2,
        bungie_display_name     = $3,
        bungie_access_token     = $4,
        bungie_refresh_token    = $5,
        bungie_token_expires_at = $6,
        bungie_kd               = $7
       WHERE id = $8`,
      [membershipId, membershipType, displayName, accessToken, refreshToken, expiresAt, kd, userId]
    )

    res.redirect(`${CLIENT_URL}/profile/edit?bungie=linked`)
  } catch (err) {
    console.error('Bungie OAuth error:', err)
    res.redirect(`${CLIENT_URL}/profile/edit?bungie=error`)
  }
}

// ─── Unlink Bungie account ────────────────────────────────────────────────────
export async function unlinkBungie(req, res) {
  try {
    await pool.query(
      `UPDATE users SET
        bungie_membership_id    = NULL,
        bungie_membership_type  = NULL,
        bungie_display_name     = NULL,
        bungie_access_token     = NULL,
        bungie_refresh_token    = NULL,
        bungie_token_expires_at = NULL
       WHERE id = $1`,
      [req.user.id]
    )
    res.json({ message: 'Bungie account unlinked.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── Fetch Marathon stats ─────────────────────────────────────────────────────
export async function getBungieStats(req, res) {
  try {
    const result = await pool.query(
      'SELECT bungie_membership_id, bungie_membership_type, bungie_access_token, bungie_token_expires_at, bungie_display_name FROM users WHERE id = $1',
      [req.user.id]
    )
    const user = result.rows[0]

    if (!user?.bungie_membership_id) {
      return res.status(404).json({ message: 'No Bungie account linked.' })
    }

    // Refresh token if it expires within 5 minutes
    let accessToken = user.bungie_access_token
    if (new Date(user.bungie_token_expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
      accessToken = await refreshAccessToken(req.user.id)
      if (!accessToken) return res.status(401).json({ message: 'Bungie session expired. Please re-link your account.' })
    }

    const { membershipType, membershipId } = { membershipType: user.bungie_membership_type, membershipId: user.bungie_membership_id }

    // Fetch the Destiny2/Marathon profile with characters + stats components
    // Component 100 = Profiles, 200 = Characters, 1000 = PresentationNodes (for records/triumphs)
    const profileData = await bungieGet(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200`,
      accessToken
    )

    if (profileData.ErrorCode && profileData.ErrorCode !== 1) {
      // ErrorCode 1 = Success in Bungie API
      return res.json({
        display_name: user.bungie_display_name,
        stats: null,
        message: 'Stats not available for this account yet.',
      })
    }

    // Pull character data if available
    const characters = profileData.Response?.characters?.data
    const characterList = characters ? Object.values(characters) : []

    // Fetch aggregate stats across all characters
    let aggregateStats = null
    if (membershipId) {
      const statsData = await bungieGet(
        `/Destiny2/${membershipType}/Account/${membershipId}/Stats/`,
        accessToken
      )
      aggregateStats = statsData.Response?.mergedAllCharacters?.results?.allPvP?.allTime || null
    }

    // Shape the response — only include stats that exist
    const stats = {}
    if (aggregateStats) {
      if (aggregateStats.kills)         stats.kills         = aggregateStats.kills.basic.displayValue
      if (aggregateStats.deaths)        stats.deaths        = aggregateStats.deaths.basic.displayValue
      if (aggregateStats.killsDeathsRatio) stats.kd         = aggregateStats.killsDeathsRatio.basic.displayValue
      if (aggregateStats.activitiesEntered) stats.matches   = aggregateStats.activitiesEntered.basic.displayValue
      if (aggregateStats.activitiesWon)    stats.wins       = aggregateStats.activitiesWon.basic.displayValue
      if (aggregateStats.winLossRatio)     stats.winRate    = aggregateStats.winLossRatio.basic.displayValue
    }

    res.json({
      display_name: user.bungie_display_name,
      characters: characterList.length,
      stats: Object.keys(stats).length > 0 ? stats : null,
      message: Object.keys(stats).length === 0 ? 'No Marathon stats found yet — play some matches!' : null,
    })
  } catch (err) {
    console.error('Bungie stats error:', err)
    res.status(500).json({ message: 'Failed to fetch Bungie stats.' })
  }
}

// ─── Helper: refresh an expired access token ─────────────────────────────────
async function refreshAccessToken(userId) {
  try {
    const result = await pool.query('SELECT bungie_refresh_token FROM users WHERE id = $1', [userId])
    const refreshToken = result.rows[0]?.bungie_refresh_token
    if (!refreshToken) return null

    const tokenRes = await fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-API-Key': BUNGIE_API_KEY },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: BUNGIE_CLIENT_ID,
        client_secret: BUNGIE_CLIENT_SECRET,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) return null

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
    await pool.query(
      'UPDATE users SET bungie_access_token = $1, bungie_refresh_token = $2, bungie_token_expires_at = $3 WHERE id = $4',
      [tokenData.access_token, tokenData.refresh_token, expiresAt, userId]
    )
    return tokenData.access_token
  } catch {
    return null
  }
}
