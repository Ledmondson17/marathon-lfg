import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Store uploads in memory temporarily, then stream to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})

// Helper: upload a buffer to Cloudinary, returns { url, public_id }
export function uploadToCloudinary(buffer, options = {}) {
  const defaults = { folder: 'marathon-lfg', transformation: [{ width: 1280, height: 720, crop: 'limit' }] }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...defaults, ...options },
      (error, result) => {
        if (error) reject(error)
        else resolve({ url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export { cloudinary }
