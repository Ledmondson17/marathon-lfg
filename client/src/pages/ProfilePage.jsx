import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'

const CLASS_COLORS = {
  Recon: 'bg-blue-900/40 border-blue-700 text-blue-300',
  Vandal: 'bg-red-900/40 border-red-700 text-red-300',
  Destroyer: 'bg-orange-900/40 border-orange-700 text-orange-300',
  Assassin: 'bg-purple-900/40 border-purple-700 text-purple-300',
  Thief: 'bg-yellow-900/40 border-yellow-700 text-yellow-300',
  Triage: 'bg-green-900/40 border-green-700 text-green-300',
  Sentinel: 'bg-cyan-900/40 border-cyan-700 text-cyan-300',
}

const PLATFORM_LABELS = { ps5: 'PS5', xbox: 'Xbox', pc: 'PC' }

const SOCIAL_LINKS = [
  { key: 'twitch', label: 'Twitch', base: 'https://twitch.tv/' },
  { key: 'discord', label: 'Discord', base: null },
  { key: 'youtube', label: 'YouTube', base: 'https://youtube.com/@' },
  { key: 'instagram', label: 'Instagram', base: 'https://instagram.com/' },
  { key: 'twitter', label: 'Twitter / X', base: 'https://x.com/' },
]

export default function ProfilePage() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bungieStats, setBungieStats] = useState(null)
  const [connStatus, setConnStatus] = useState(null) // { id, status, i_sent } or null
  const [connLoading, setConnLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${username}`)
        setProfile(res.data)
      } catch (err) {
        setError(err.response?.status === 404 ? 'Player not found.' : 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  // Fetch connection status when viewing someone else's profile
  useEffect(() => {
    if (!currentUser || currentUser.username === username) return
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`/api/connections/status/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setConnStatus(res.data)
      } catch {
        // Not logged in or error — no button shown
      }
    }
    fetchStatus()
  }, [username, currentUser])

  const handleRunTogether = async () => {
    setConnLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/connections', { recipient_username: username }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConnStatus({ id: res.data.id, status: 'pending', i_sent: true })
    } catch {
      // Already requested or error — refresh status
    } finally {
      setConnLoading(false)
    }
  }

  const handleRemoveConnection = async () => {
    if (!connStatus?.id) return
    setConnLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/connections/${connStatus.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConnStatus({ status: 'none' })
    } catch {
      // ignore
    } finally {
      setConnLoading(false)
    }
  }

  // Fetch Bungie stats only if viewing your own profile (requires auth token)
  useEffect(() => {
    setBungieStats(null) // Always clear when navigating to a different profile
    const fetchStats = async () => {
      const token = localStorage.getItem('token')
      if (!token || !currentUser || currentUser.username !== username) return
      try {
        const res = await axios.get('/api/auth/bungie/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setBungieStats(res.data)
      } catch {
        // Stats not available — no problem, just don't show the section
      }
    }
    fetchStats()
  }, [username, currentUser])

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (error) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-400">{error}</div>

  const isOwnProfile = currentUser?.username === username

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-brand-card border-2 border-brand-border overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-brand-muted">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-text">{profile.username}</h1>
              {profile.region && (
                <p className="text-brand-muted text-sm mt-0.5">{profile.region} · {profile.timezone}</p>
              )}
              {/* Platforms */}
              <div className="flex gap-2 mt-2">
                {profile.platforms?.map((p) => (
                  <span key={p} className="bg-brand-card border border-brand-border text-brand-muted text-xs px-2 py-0.5 rounded">
                    {PLATFORM_LABELS[p] || p}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {isOwnProfile ? (
            <Link
              to="/profile/edit"
              className="bg-brand-card border border-brand-border hover:border-brand-accent text-brand-text text-sm px-4 py-2 rounded transition-colors flex-shrink-0"
            >
              Edit Profile
            </Link>
          ) : currentUser && connStatus && (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {/* No connection yet */}
              {connStatus.status === 'none' && (
                <button onClick={handleRunTogether} disabled={connLoading}
                  className="bg-brand-accent hover:bg-brand-accentHover disabled:opacity-50 text-white text-sm px-4 py-2 rounded font-medium transition-colors">
                  {connLoading ? 'Sending...' : 'Run Together'}
                </button>
              )}
              {/* Request sent, waiting */}
              {connStatus.status === 'pending' && connStatus.i_sent && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-brand-muted text-sm px-4 py-2 border border-brand-border rounded">
                    Request Sent
                  </span>
                  <button onClick={handleRemoveConnection}
                    className="text-brand-muted hover:text-red-400 text-xs transition-colors">
                    Cancel
                  </button>
                </div>
              )}
              {/* They sent you a request */}
              {connStatus.status === 'pending' && !connStatus.i_sent && (
                <div className="flex gap-2">
                  <button onClick={async () => {
                    const token = localStorage.getItem('token')
                    await axios.put(`/api/connections/${connStatus.id}`, { action: 'accept' }, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                    setConnStatus({ ...connStatus, status: 'accepted' })
                  }}
                    className="bg-brand-accent hover:bg-brand-accentHover text-white text-sm px-3 py-2 rounded font-medium transition-colors">
                    Accept
                  </button>
                  <button onClick={async () => {
                    const token = localStorage.getItem('token')
                    await axios.put(`/api/connections/${connStatus.id}`, { action: 'decline' }, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                    setConnStatus({ status: 'none' })
                  }}
                    className="bg-brand-card border border-brand-border hover:border-red-500 text-brand-muted hover:text-red-400 text-sm px-3 py-2 rounded transition-colors">
                    Decline
                  </button>
                </div>
              )}
              {/* Already squadmates */}
              {connStatus.status === 'accepted' && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-green-400 text-sm px-4 py-2 border border-green-800 rounded bg-green-900/20">
                    ✓ Squadmates
                  </span>
                  <button onClick={handleRemoveConnection}
                    className="text-brand-muted hover:text-red-400 text-xs transition-colors">
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top classes */}
        {profile.top_classes?.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">Top Classes</h2>
            <div className="flex flex-wrap gap-3">
              {profile.top_classes.map((cls, i) => (
                <div key={cls} className={`border rounded-lg px-4 py-2 text-sm font-medium ${CLASS_COLORS[cls] || 'bg-brand-card border-brand-border text-brand-text'}`}>
                  <span className="text-xs opacity-60 mr-1">#{i + 1}</span>
                  {cls}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bungie stats */}
        {(profile.bungie_display_name || bungieStats) && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Bungie Account</h2>
              <span className="text-xs text-brand-muted border border-brand-border rounded px-2 py-0.5">
                Destiny 2 stats · Marathon stats coming soon
              </span>
            </div>
            {profile.bungie_display_name && (
              <p className="text-brand-text text-sm mb-4">
                <span className="text-brand-muted">Linked as </span>
                <span className="text-brand-accent font-medium">{profile.bungie_display_name}</span>
              </p>
            )}
            {bungieStats?.stats && (
              <div className="grid grid-cols-3 gap-3">
                {bungieStats.stats.kd && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-3 text-center">
                    <p className="text-brand-accent text-lg font-bold">{bungieStats.stats.kd}</p>
                    <p className="text-brand-muted text-xs mt-0.5">K/D</p>
                  </div>
                )}
                {bungieStats.stats.kills && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-3 text-center">
                    <p className="text-brand-accent text-lg font-bold">{bungieStats.stats.kills}</p>
                    <p className="text-brand-muted text-xs mt-0.5">Kills</p>
                  </div>
                )}
                {bungieStats.stats.wins && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-3 text-center">
                    <p className="text-brand-accent text-lg font-bold">{bungieStats.stats.wins}</p>
                    <p className="text-brand-muted text-xs mt-0.5">Wins</p>
                  </div>
                )}
                {bungieStats.stats.matches && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-3 text-center">
                    <p className="text-brand-accent text-lg font-bold">{bungieStats.stats.matches}</p>
                    <p className="text-brand-muted text-xs mt-0.5">Matches</p>
                  </div>
                )}
                {bungieStats.stats.winRate && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-3 text-center">
                    <p className="text-brand-accent text-lg font-bold">{bungieStats.stats.winRate}</p>
                    <p className="text-brand-muted text-xs mt-0.5">Win Rate</p>
                  </div>
                )}
                {bungieStats.stats.deaths && (
                  <div className="bg-brand-card border border-brand-border rounded-lg p-3 text-center">
                    <p className="text-brand-accent text-lg font-bold">{bungieStats.stats.deaths}</p>
                    <p className="text-brand-muted text-xs mt-0.5">Deaths</p>
                  </div>
                )}
              </div>
            )}
            {bungieStats?.message && (
              <p className="text-brand-muted text-sm">{bungieStats.message}</p>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-3">About</h2>
            <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Playstyle */}
        {profile.playstyle && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-3">Gaming Philosophy & Playstyle</h2>
            <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{profile.playstyle}</p>
          </div>
        )}

        {/* Availability */}
        {profile.availability && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-3">Availability</h2>
            <p className="text-brand-text">{profile.availability}</p>
          </div>
        )}

        {/* Socials */}
        {SOCIAL_LINKS.some((s) => profile.socials?.[s.key]) && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">Socials</h2>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.filter((s) => profile.socials?.[s.key]).map(({ key, label, base }) => {
                const handle = profile.socials[key]
                const href = base ? `${base}${handle}` : null
                return href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-card border border-brand-border hover:border-brand-accent text-brand-text text-sm px-4 py-2 rounded transition-colors"
                  >
                    {label}: <span className="text-brand-accent">{handle}</span>
                  </a>
                ) : (
                  <div key={key} className="bg-brand-card border border-brand-border text-brand-text text-sm px-4 py-2 rounded">
                    {label}: <span className="text-brand-accent">{handle}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Squadmates */}
        {profile.squadmates?.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
              Squadmates ({profile.squadmates.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.squadmates.map((s) => (
                <Link
                  key={s.username}
                  to={`/profile/${s.username}`}
                  className="flex items-center gap-2 bg-brand-card border border-brand-border hover:border-brand-accent rounded-lg px-3 py-2 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-border overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-brand-muted">
                    {s.avatar_url
                      ? <img src={s.avatar_url} alt={s.username} className="w-full h-full object-cover" />
                      : s.username[0].toUpperCase()
                    }
                  </div>
                  <span className="text-brand-text text-sm group-hover:text-brand-accent transition-colors">
                    {s.username}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Media */}
        {profile.media?.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">Clips & Screenshots</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.media.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={item.url}
                    alt="gameplay"
                    className="w-full aspect-video object-cover rounded-lg border border-brand-border hover:border-brand-accent transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
