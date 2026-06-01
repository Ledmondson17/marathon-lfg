import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-brand-surface border-b border-brand-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          <span className="text-brand-accent">MARATHON</span>
          <span className="text-brand-text"> LFG</span>
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
