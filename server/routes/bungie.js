import { Router } from 'express'
import { initiateBungieOAuth, handleBungieCallback, unlinkBungie, getBungieStats } from '../controllers/bungieController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Step 1 — logged-in user clicks "Link Bungie Account", we send them to Bungie
router.get('/link', requireAuth, initiateBungieOAuth)

// Step 2 — Bungie redirects back here after the user approves
router.get('/callback', handleBungieCallback)

// Unlink Bungie account
router.delete('/unlink', requireAuth, unlinkBungie)

// Fetch latest Marathon stats for the logged-in user
router.get('/stats', requireAuth, getBungieStats)

export default router
