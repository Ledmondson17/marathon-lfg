import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

// Store uploads in memory temporarily, then stream to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    cb(null, ALL_ALLOWED.includes(file.mimetype))
  },
})

// Avatar upload stays image-only with a smaller size limit
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for avatars
  fileFilter: (req, file, cb) => {
    cb(null, ALLOWED_IMAGE_TYPES.includes(file.mimetype))
  },
})

// Helper: upload a buffer to Cloudinary, returns { url, public_id, resource_type }
export function uploadToCloudinary(buffer, options = {}) {
  const isVideo = options.resource_type === 'video'
  const defaults = isVideo
    ? {
        folder: 'marathon-lfg',
        resource_type: 'video',
        // Limit video resolution to 1080p max to save bandwidth
        transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
      }
    : {
        folder: 'marathon-lfg',
        resource_type: 'image',
        transformation: [{ width: 1280, height: 720, crop: 'limit' }],
      }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...defaults, ...options },
      (error, result) => {
        if (error) reject(error)
        else resolve({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        })
      }
    )
    stream.end(buffer)
  })
}

export { cloudinary }
