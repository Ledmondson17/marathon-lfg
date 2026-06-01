import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  sendRequest,
  getConnections,
  respondToRequest,
  removeConnection,
  getConnectionStatus,
  getPendingCount,
} from '../controllers/connectionController.js'

const router = Router()

router.post('/', requireAuth, sendRequest)                    // Send a request
router.get('/', requireAuth, getConnections)                  // Get all connections + requests
router.get('/pending-count', requireAuth, getPendingCount)    // Navbar badge count
router.get('/status/:username', requireAuth, getConnectionStatus) // Button state on a profile
router.put('/:id', requireAuth, respondToRequest)             // Accept or decline
router.delete('/:id', requireAuth, removeConnection)          // Remove connection

export default router
