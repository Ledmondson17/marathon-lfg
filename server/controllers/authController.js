import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'

export async function register(req, res) {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' })
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be 3–20 characters.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email or username already in use.' })
    }

    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email.toLowerCase(), hash]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email }, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({ user: { id: user.id, username: user.username, email: user.email }, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
