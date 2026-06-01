import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axios'

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/connections', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConnections(res.data)
    } catch {
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConnections() }, [])

  const respond = async (id, action) => {
    const token = localStorage.getItem('token')
    await axios.put(`/api/connections/${id}`, { action }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchConnections()
  }

  const remove = async (id) => {
    const token = localStorage.getItem('token')
    await axios.delete(`/api/connections/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchConnections()
  }

  const pending   = connections.filter(c => c.status === 'pending' && !c.i_sent)
  const sent      = connections.filter(c => c.status === 'pending' && c.i_sent)
  const squadmates = connections.filter(c => c.status === 'accepted')

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">
      Loading...
    </div>
  )

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Squad Requests</h1>
        <p className="text-brand-muted text-sm mb-10">Manage your connections and squadmates</p>

        {/* Incoming requests */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
            Incoming Requests {pending.length > 0 && (
              <span className="ml-2 bg-brand-accent text-white text-xs rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </h2>
          {pending.length === 0 ? (
            <p className="text-brand-muted text-sm">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((c) => (
                <div key={c.id} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <Link to={`/profile/${c.other_username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-border overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-brand-muted">
                      {c.other_avatar
                        ? <img src={c.other_avatar} alt={c.other_username} className="w-full h-full object-cover" />
                        : c.other_username[0].toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-brand-text font-medium text-sm">{c.other_username}</p>
                      {c.other_region && (
                        <p className="text-brand-muted text-xs">{c.other_region} · {c.other_timezone}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => respond(c.id, 'accept')}
                      className="bg-brand-accent hover:bg-brand-accentHover text-white text-sm px-4 py-1.5 rounded font-medium transition-colors">
                      Accept
                    </button>
                    <button onClick={() => respond(c.id, 'decline')}
                      className="bg-brand-card border border-brand-border hover:border-red-500 text-brand-muted hover:text-red-400 text-sm px-4 py-1.5 rounded transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Squadmates */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
            Squadmates ({squadmates.length})
          </h2>
          {squadmates.length === 0 ? (
            <p className="text-brand-muted text-sm">No squadmates yet. Find players and send a request!</p>
          ) : (
            <div className="space-y-3">
              {squadmates.map((c) => (
                <div key={c.id} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <Link to={`/profile/${c.other_username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-border overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-brand-muted">
                      {c.other_avatar
                        ? <img src={c.other_avatar} alt={c.other_username} className="w-full h-full object-cover" />
                        : c.other_username[0].toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-brand-text font-medium text-sm">{c.other_username}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {c.other_classes?.slice(0, 3).map(cls => (
                          <span key={cls} className="text-brand-muted text-xs border border-brand-border rounded px-1.5">{cls}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                  <button onClick={() => remove(c.id)}
                    className="text-brand-muted hover:text-red-400 text-xs transition-colors flex-shrink-0">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sent requests */}
        {sent.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
              Sent Requests ({sent.length})
            </h2>
            <div className="space-y-3">
              {sent.map((c) => (
                <div key={c.id} className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <Link to={`/profile/${c.other_username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-border overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-brand-muted">
                      {c.other_avatar
                        ? <img src={c.other_avatar} alt={c.other_username} className="w-full h-full object-cover" />
                        : c.other_username[0].toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-brand-text font-medium text-sm">{c.other_username}</p>
                      <p className="text-brand-muted text-xs">Awaiting response</p>
                    </div>
                  </Link>
                  <button onClick={() => remove(c.id)}
                    className="text-brand-muted hover:text-red-400 text-xs transition-colors flex-shrink-0">
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
