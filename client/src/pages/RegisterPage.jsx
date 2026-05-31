import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      login(res.data.user, res.data.token)
      navigate('/profile/edit')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-2">Create your profile</h1>
        <p className="text-brand-muted text-sm mb-8">Join Marathon LFG and find your squad</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1.5">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
              className="w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="YourGamertag"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-accentHover disabled:opacity-50 text-white py-2.5 rounded font-semibold transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-brand-muted text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
