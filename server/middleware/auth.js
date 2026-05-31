import jwt from 'jsonwebtoken'

// Middleware that checks the Authorization header for a valid JWT.
// Attaches the decoded user payload to req.user if valid.
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]  // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}
