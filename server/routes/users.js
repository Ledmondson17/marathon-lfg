import { Router } from 'express'
import { getPlayers, getProfile, updateProfile, uploadAvatar, uploadMedia, deleteMedia, deleteAccount } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'
import { upload, avatarUpload } from '../middleware/upload.js'

const router = Router()

router.get('/', getPlayers)                          // GET /api/users?platform=ps5&class=Recon
router.get('/:username', getProfile)                 // GET /api/users/johndoe
router.put('/me', requireAuth, updateProfile)        // PUT /api/users/me (auth required)
router.post('/me/avatar', requireAuth, avatarUpload.single('file'), uploadAvatar)
router.post('/me/media', requireAuth, upload.single('file'), uploadMedia)
router.delete('/me/media/:mediaId', requireAuth, deleteMedia)
router.delete('/me', requireAuth, deleteAccount)

export default router
