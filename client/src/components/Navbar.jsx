import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import axios from '../api/axios'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  // Poll for pending connection requests every 30 seconds while logged in
  useEffect(() => {
    if (!user) return
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/connections/pending-count', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPendingCount(res.data.count)
      } catch {
        // Silently fail — not critical
      }
    }
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-brand-surface border-b border-brand-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          <span className="text-brand-accent">SHELL</span>
          <span className="text-brand-text"> SEARCHER</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            to="/players"
            className="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
          >
            Find Players
          </Link>
          <Link
            to="/about"
            className="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
          >
            About
          </Link>

          {user ? (
            <>
              {/* Connections inbox with badge */}
              <Link
                to="/connections"
                className="relative text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
              >
                Squad Requests
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-brand-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </Link>
              <Link
                to={`/profile/${user.username}`}
                className="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text px-4 py-1.5 rounded text-sm transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-brand-accent hover:bg-brand-accentHover text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
