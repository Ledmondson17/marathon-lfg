import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axios'
import { ALL_SALVAGE, getSalvageTier, TIER_COLORS } from '../data/salvage'
import { ACTIVITIES, getActivity } from '../data/activities'
import { CONTRACT_FACTIONS, getContractFaction } from '../data/contracts'
import { MAPS, getMap } from '../data/maps'

const MARATHON_CLASSES = ['Recon', 'Vandal', 'Destroyer', 'Assassin', 'Thief', 'Triage', 'Sentinel']
const PLATFORMS = ['ps5', 'xbox', 'pc']
const PLATFORM_LABELS = { ps5: 'PS5', xbox: 'Xbox', pc: 'PC' }

export default function PlayerListPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ platform: '', class: '', search: '', kd: '', timezone: '', salvage: '', activity: '', contract: '', map: '', mic: '' })

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const params = {}
        if (filters.platform) params.platform = filters.platform
        if (filters.class) params.class = filters.class
        if (filters.search) params.search = filters.search
        if (filters.kd) params.kd = filters.kd
        if (filters.timezone) params.timezone = filters.timezone
        if (filters.salvage) params.salvage = filters.salvage
        if (filters.activity) params.activity = filters.activity
        if (filters.contract) params.contract = filters.contract
        if (filters.map) params.map = filters.map
        if (filters.mic) params.mic = filters.mic
        const res = await axios.get('/api/users', { params })
        setPlayers(res.data)
      } catch {
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [filters])

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Find Players</h1>
        <p className="text-brand-muted mb-8">Browse Marathon players on Shell Searcher and find your next squad</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            placeholder="Search username..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors text-sm"
          />
          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
          <select
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All Classes</option>
            {MARATHON_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.kd}
            onChange={(e) => setFilters({ ...filters, kd: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All K/D</option>
            <option value="0-1.0">0 – 1.0 K/D</option>
            <option value="1.1-1.29">1.1 – 1.29 K/D</option>
            <option value="1.3-1.69">1.3 – 1.69 K/D</option>
            <option value="1.7-1.99">1.7 – 1.99 K/D</option>
            <option value="2.0+">2.0+ K/D</option>
          </select>
          <select
            value={filters.timezone}
            onChange={(e) => setFilters({ ...filters, timezone: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All Timezones</option>
            <option value="ET">ET — Eastern</option>
            <option value="CT">CT — Central</option>
            <option value="MT">MT — Mountain</option>
            <option value="PT">PT — Pacific</option>
            <option value="GMT">GMT — Greenwich</option>
            <option value="CET">CET — Central European</option>
            <option value="JST">JST — Japan</option>
            <option value="AEST">AEST — Australia Eastern</option>
          </select>
          <select
            value={filters.mic}
            onChange={(e) => setFilters({ ...filters, mic: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">🎙 Any Mic Status</option>
            <option value="true">🎙 Has Mic</option>
            <option value="false">🔇 No Mic</option>
          </select>
          <select
            value={filters.map}
            onChange={(e) => setFilters({ ...filters, map: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All Maps</option>
            {MAPS.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}{m.badge ? ' ★ S2' : ''}
              </option>
            ))}
          </select>
          <select
            value={filters.contract}
            onChange={(e) => setFilters({ ...filters, contract: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All Contracts</option>
            {Object.entries(CONTRACT_FACTIONS).map(([faction, data]) => (
              <optgroup key={faction} label={`— ${faction} —`}>
                {data.contracts.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <select
            value={filters.activity}
            onChange={(e) => setFilters({ ...filters, activity: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">All Activities</option>
            {ACTIVITIES.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <select
            value={filters.salvage}
            onChange={(e) => setFilters({ ...filters, salvage: e.target.value })}
            className="bg-brand-surface border border-brand-border rounded px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors text-sm"
          >
            <option value="">Hunting Any Salvage</option>
            {['Exotic', 'Rare', 'Uncommon', 'Common', 'Unstable'].map(tier => (
              <optgroup key={tier} label={`— ${tier} —`}>
                {ALL_SALVAGE
                  .filter(item => getSalvageTier(item) === tier)
                  .map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Player cards */}
        {loading ? (
          <p className="text-brand-muted">Loading players...</p>
        ) : players.length === 0 ? (
          <p className="text-brand-muted">No players found. Be the first to create a profile!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((player) => (
              <Link
                key={player.id}
                to={`/profile/${player.username}`}
                className="bg-brand-surface border border-brand-border hover:border-brand-accent rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-xl font-bold text-brand-muted flex-shrink-0 overflow-hidden">
                    {player.avatar_url
                      ? <img src={player.avatar_url} alt={player.username} className="w-full h-full object-cover" />
                      : player.username[0].toUpperCase()
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text group-hover:text-brand-accent transition-colors">
                      {player.username}
                    </p>
                    {(player.region || player.timezone) && (
                      <p className="text-brand-muted text-xs">
                        {[player.region, player.timezone].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activity badge + classes on the same row */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {player.preferred_activity && (() => {
                    const activity = getActivity(player.preferred_activity)
                    return activity ? (
                      <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${activity.badge}`}>
                        {activity.label}
                      </span>
                    ) : null
                  })()}
                  {player.top_classes?.map((cls) => (
                    <span key={cls} className="bg-brand-card border border-brand-border text-brand-muted text-xs px-2 py-0.5 rounded">
                      {cls}
                    </span>
                  ))}
                </div>

                {player.active_contract && (() => {
                  const data = getContractFaction(player.active_contract)
                  return data ? (
                    <div className={`text-xs border rounded-lg px-2.5 py-1.5 mb-2 inline-flex flex-col ${data.badge}`}>
                      <span className="opacity-60 uppercase tracking-wide text-[10px] font-semibold">{data.faction}</span>
                      <span className="font-medium">{player.active_contract}</span>
                    </div>
                  ) : null
                })()}
                {(player.playstyle || player.bio) && (
                  <p className="text-brand-muted text-sm line-clamp-2">{player.playstyle || player.bio}</p>
                )}
                {player.bungie_kd != null && (
                  <p className="text-brand-muted text-xs mt-2">
                    K/D <span className="text-brand-accent font-semibold">{player.bungie_kd}</span>
                  </p>
                )}
                {player.looking_for_salvage?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-brand-muted text-xs mr-1">Hunting:</span>
                    {player.looking_for_salvage.slice(0, 3).map(item => (
                      <span key={item} className={`text-xs border rounded-full px-2 py-0.5 ${TIER_COLORS[getSalvageTier(item)]}`}>
                        {item}
                      </span>
                    ))}
                    {player.looking_for_salvage.length > 3 && (
                      <span className="text-brand-muted text-xs">+{player.looking_for_salvage.length - 3} more</span>
                    )}
                  </div>
                )}

                {player.has_mic === true && (
                  <span className="inline-block text-xs bg-green-900/40 border border-green-600 text-green-300 rounded px-2 py-0.5 mt-1">
                    🎙 Has Mic
                  </span>
                )}
                {player.has_mic === false && (
                  <span className="inline-block text-xs bg-red-900/40 border border-red-700 text-red-300 rounded px-2 py-0.5 mt-1">
                    🔇 No Mic
                  </span>
                )}
                {player.preferred_maps?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {player.preferred_maps.map(mapId => {
                      const map = getMap(mapId)
                      return map ? (
                        <span key={mapId} className={`text-xs border rounded px-2 py-0.5 ${map.color}`}>
                          {map.label}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
                {player.platforms?.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {player.platforms.map((p) => (
                      <span key={p} className="text-xs text-brand-muted border border-brand-border rounded px-2 py-0.5">
                        {PLATFORM_LABELS[p] || p}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
