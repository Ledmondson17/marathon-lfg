import { Router } from 'express'
import { initiateBungieOAuth, handleBungieCallback, unlinkBungie, getBungieStats } from '../controllers/bungieController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Step 1 — logged-in user clicks "Link Bungie Account", we send them to Bungie
// Token can be passed as a query param since this is a browser redirect, not an API call
router.get('/link', (req, res, next) => {
  // Accept token from query string as well as Authorization header
  if (req.query.token && !req.headers['authorization']) {
    req.headers['authorization'] = `Bearer ${req.query.token}`
  }
  next()
}, requireAuth, initiateBungieOAuth)

// Step 2 — Bungie redirects back here after the user approves
router.get('/callback', handleBungieCallback)

// Unlink Bungie account
router.delete('/unlink', requireAuth, unlinkBungie)

// Fetch latest Marathon stats for the logged-in user
router.get('/stats', requireAuth, getBungieStats)

export default router
