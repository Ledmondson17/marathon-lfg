import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import SalvagePicker from '../components/SalvagePicker'
import ContractPicker from '../components/ContractPicker'
import { ACTIVITIES } from '../data/activities'
import { MAPS } from '../data/maps'

const MARATHON_CLASSES = ['Recon', 'Vandal', 'Destroyer', 'Assassin', 'Thief', 'Triage', 'Sentinel']
const PLATFORMS = ['ps5', 'xbox', 'pc']
const PLATFORM_LABELS = { ps5: 'PS5', xbox: 'Xbox', pc: 'PC' }
const TIMEZONES = ['ET', 'CT', 'MT', 'PT', 'GMT', 'CET', 'JST', 'AEST']

export default function EditProfilePage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const avatarInputRef = useRef(null)
  const mediaInputRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bungieStatus, setBungieStatus] = useState(null) // 'linked' | 'error' | null
  const [bungieDisplayName, setBungieDisplayName] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [media, setMedia] = useState([])
  const [mediaUploading, setMediaUploading] = useState(false)

  const [form, setForm] = useState({
    bio: '',
    playstyle: '',
    availability: '',
    region: '',
    timezone: '',
    platforms: [],
    top_classes: [],
    socials: { twitch: '', discord: '', youtube: '', instagram: '', twitter: '' },
    looking_for_salvage: [],
    preferred_activity: '',
    active_contract: '',
    preferred_maps: [],
  })

  // Check if Bungie just redirected back with a result
  useEffect(() => {
    const bungie = searchParams.get('bungie')
    if (bungie === 'linked') setBungieStatus('linked')
    if (bungie === 'error')  setBungieStatus('error')
  }, [searchParams])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${user.username}`)
        const p = res.data
        setAvatarPreview(p.avatar_url || null)
        setMedia(p.media || [])
        setBungieDisplayName(p.bungie_display_name || null)
        setForm({
          bio: p.bio || '',
          playstyle: p.playstyle || '',
          availability: p.availability || '',
          region: p.region || '',
          timezone: p.timezone || '',
          platforms: p.platforms || [],
          top_classes: p.top_classes || [],
          socials: { twitch: '', discord: '', youtube: '', instagram: '', twitter: '', ...p.socials },
          looking_for_salvage: p.looking_for_salvage || [],
          preferred_activity: p.preferred_activity || '',
          active_contract: p.active_contract || '',
          preferred_maps: p.preferred_maps || [],
        })
      } catch {
        // No existing profile yet
      }
    }
    fetchProfile()
  }, [user.username])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSocialChange = (e) => setForm({ ...form, socials: { ...form.socials, [e.target.name]: e.target.value } })

  const togglePlatform = (platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const toggleClass = (cls) => {
    setForm((prev) => {
      if (prev.top_classes.includes(cls)) return { ...prev, top_classes: prev.top_classes.filter((c) => c !== cls) }
      if (prev.top_classes.length >= 3) return prev
      return { ...prev, top_classes: [...prev.top_classes, cls] }
    })
  }

  // --- Avatar upload ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show a local preview immediately while uploading
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/users/me/avatar', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      setAvatarPreview(res.data.avatar_url)
    } catch {
      setError('Avatar upload failed. Please try again.')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
    }
  }

  // --- Media upload ---
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    if (media.length + files.length > 10) {
      setError(`You can only have 10 clips/screenshots. You have ${media.length} — can add ${10 - media.length} more.`)
      return
    }

    setMediaUploading(true)
    setError('')
    const token = localStorage.getItem('token')

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await axios.post('/api/users/me/media', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        })
        setMedia((prev) => [...prev, res.data])
      } catch {
        setError('One or more files failed to upload.')
      }
    }
    setMediaUploading(false)
  }

  const handleDeleteMedia = async (mediaId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/users/me/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMedia((prev) => prev.filter((m) => m.id !== mediaId))
    } catch {
      setError('Failed to delete. Please try again.')
    }
  }

  // --- Save profile fields ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/users/me', form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Profile saved!')
      setTimeout(() => navigate(`/profile/${user.username}`), 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors'
  const labelClass = 'block text-sm font-medium text-brand-muted mb-1.5'

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
        <p className="text-brand-muted text-sm mb-8">Tell the community who you are</p>

        {error && <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-900/30 border border-green-700 text-green-300 rounded px-4 py-3 mb-6 text-sm">{success}</div>}

        {/* Avatar */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 mb-6">
          <h2 className={labelClass}>Profile Picture</h2>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => avatarInputRef.current.click()}
              className="relative w-20 h-20 rounded-full bg-brand-card border-2 border-brand-border hover:border-brand-accent transition-colors overflow-hidden flex-shrink-0 group"
              title="Click to upload photo"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-brand-muted">
                  {user.username[0].toUpperCase()}
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">
                  {avatarUploading ? 'Uploading...' : 'Change'}
                </span>
              </div>
            </button>
            <div>
              <p className="text-brand-text text-sm font-medium">Click your avatar to upload a new photo</p>
              <p className="text-brand-muted text-xs mt-1">JPG, PNG, GIF or WebP · Max 10MB</p>
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Bio */}
          <div>
            <label className={labelClass}>Personal Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} maxLength={500}
              className={inputClass} placeholder="Tell the community a bit about yourself..." />
            <p className="text-brand-muted text-xs mt-1">{form.bio.length}/500</p>
          </div>

          {/* Playstyle */}
          <div>
            <label className={labelClass}>Gaming Philosophy & Playstyle</label>
            <textarea name="playstyle" value={form.playstyle} onChange={handleChange} rows={4} maxLength={500}
              className={inputClass} placeholder="How do you play? What's your mindset going into a match?" />
            <p className="text-brand-muted text-xs mt-1">{form.playstyle.length}/500</p>
          </div>

          {/* Top Classes */}
          <div>
            <label className={labelClass}>Top 3 Classes <span className="font-normal">(select up to 3, in order)</span></label>
            <div className="grid grid-cols-3 gap-2">
              {MARATHON_CLASSES.map((cls) => {
                const idx = form.top_classes.indexOf(cls)
                const selected = idx !== -1
                return (
                  <button key={cls} type="button" onClick={() => toggleClass(cls)}
                    className={`relative border rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                        : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-accent/50'
                    }`}>
                    {selected && <span className="absolute top-1 right-1.5 text-xs opacity-70">#{idx + 1}</span>}
                    {cls}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preferred Session Activity */}
          <div>
            <label className={labelClass}>Preferred Session Activity</label>
            <div className="space-y-3">
              {ACTIVITIES.map((activity) => (
                <label key={activity.id}
                  className={`flex items-start gap-4 border rounded-xl p-4 cursor-pointer transition-colors ${
                    form.preferred_activity === activity.id
                      ? `${activity.color} border-opacity-100`
                      : 'bg-brand-card border-brand-border hover:border-brand-accent/50'
                  }`}>
                  <input
                    type="radio"
                    name="preferred_activity"
                    value={activity.id}
                    checked={form.preferred_activity === activity.id}
                    onChange={(e) => setForm({ ...form, preferred_activity: e.target.value })}
                    className="mt-0.5 accent-orange-500 flex-shrink-0"
                  />
                  <div>
                    <p className="text-brand-text font-medium text-sm">{activity.label}</p>
                    <p className="text-brand-muted text-xs mt-1 leading-relaxed">{activity.description}</p>
                  </div>
                </label>
              ))}
              {/* Allow deselecting */}
              {form.preferred_activity && (
                <button type="button"
                  onClick={() => setForm({ ...form, preferred_activity: '' })}
                  className="text-brand-muted hover:text-brand-text text-xs transition-colors">
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className={labelClass}>Platform(s)</label>
            <div className="flex gap-3">
              {PLATFORMS.map((p) => (
                <button key={p} type="button" onClick={() => togglePlatform(p)}
                  className={`border rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                    form.platforms.includes(p)
                      ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                      : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-accent/50'
                  }`}>
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Region & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Region</label>
              <input type="text" name="region" value={form.region} onChange={handleChange}
                className={inputClass} placeholder="e.g. North America" />
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <select name="timezone" value={form.timezone} onChange={handleChange} className={inputClass}>
                <option value="">Select...</option>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className={labelClass}>Availability</label>
            <input type="text" name="availability" value={form.availability} onChange={handleChange}
              className={inputClass} placeholder="e.g. Weeknights 8pm-midnight, weekends flexible" />
          </div>

          {/* Currently Hunting */}
          <div>
            <label className={labelClass}>
              Currently Hunting
              <span className="font-normal ml-1">(salvage you're looking for)</span>
            </label>
            <SalvagePicker
              selected={form.looking_for_salvage}
              onChange={(val) => setForm({ ...form, looking_for_salvage: val })}
            />
          </div>

          {/* Active Contract */}
          <div>
            <label className={labelClass}>Active Contract</label>
            <ContractPicker
              selected={form.active_contract}
              onChange={(val) => setForm({ ...form, active_contract: val })}
            />
          </div>

          {/* Preferred Maps */}
          <div>
            <label className={labelClass}>Preferred Maps <span className="font-normal">(select all that apply)</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MAPS.map((map) => {
                const selected = form.preferred_maps.includes(map.id)
                return (
                  <button key={map.id} type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        preferred_maps: selected
                          ? prev.preferred_maps.filter(m => m !== map.id)
                          : [...prev.preferred_maps, map.id]
                      }))
                    }}
                    className={`relative border rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                      selected ? map.color : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-accent/50'
                    }`}>
                    {map.label}
                    {map.badge && (
                      <span className="absolute top-1 right-1.5 text-[10px] bg-indigo-500 text-white rounded px-1 font-bold">
                        {map.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Socials */}
          <div>
            <label className={labelClass}>Social Links</label>
            <div className="space-y-3">
              {[
                { name: 'twitch', placeholder: 'Twitch username' },
                { name: 'discord', placeholder: 'Discord handle (e.g. username or user#1234)' },
                { name: 'youtube', placeholder: 'YouTube @handle' },
                { name: 'instagram', placeholder: 'Instagram username' },
                { name: 'twitter', placeholder: 'Twitter / X username' },
              ].map(({ name, placeholder }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-brand-muted text-sm w-24 capitalize">{name}</span>
                  <input type="text" name={name} value={form.socials[name]} onChange={handleSocialChange}
                    className={inputClass} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-brand-accent hover:bg-brand-accentHover disabled:opacity-50 text-white py-3 rounded font-semibold transition-colors">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* Clips & Screenshots — separate from the main form */}
        <div className="mt-10 bg-brand-surface border border-brand-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-brand-text">Clips & Screenshots</h2>
              <p className="text-brand-muted text-xs mt-0.5">{media.length}/10 uploaded · JPG, PNG, GIF, WebP, MP4, WebM · Max 100MB each</p>
            </div>
            {media.length < 10 && (
              <button
                type="button"
                onClick={() => mediaInputRef.current.click()}
                disabled={mediaUploading}
                className="bg-brand-accent hover:bg-brand-accentHover disabled:opacity-50 text-white text-sm px-4 py-2 rounded font-medium transition-colors"
              >
                {mediaUploading ? 'Uploading...' : '+ Add'}
              </button>
            )}
          </div>

          <input
            ref={mediaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
            multiple
            onChange={handleMediaUpload}
            className="hidden"
          />

          {media.length === 0 ? (
            <button
              type="button"
              onClick={() => mediaInputRef.current.click()}
              className="w-full border-2 border-dashed border-brand-border hover:border-brand-accent rounded-xl py-12 text-brand-muted hover:text-brand-text transition-colors text-sm"
            >
              Click to upload your first clip or screenshot
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {media.map((item) => (
                <div key={item.id} className="relative group">
                  {item.resource_type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full aspect-video object-cover rounded-lg border border-brand-border"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt="gameplay"
                      className="w-full aspect-video object-cover rounded-lg border border-brand-border"
                    />
                  )}
                  {/* Delete button appears on hover */}
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item.id)}
                    className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bungie Account */}
        <div className="mt-6 bg-brand-surface border border-brand-border rounded-xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-brand-text">Bungie Account</h2>
              {bungieDisplayName ? (
                <p className="text-brand-muted text-xs mt-0.5">
                  Linked as <span className="text-brand-accent">{bungieDisplayName}</span>
                </p>
              ) : (
                <p className="text-brand-muted text-xs mt-0.5">Link your account to show Marathon stats on your profile</p>
              )}
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL || ''}/api/auth/bungie/link?token=${localStorage.getItem('token')}`}
              className="bg-brand-card border border-brand-border hover:border-brand-accent text-brand-text text-sm px-4 py-2 rounded transition-colors flex-shrink-0"
            >
              {bungieDisplayName ? 'Re-link' : 'Link Bungie'}
            </a>
          </div>
          {bungieStatus === 'linked' && (
            <p className="text-green-400 text-xs mt-3">✓ Bungie account linked successfully!</p>
          )}
          {bungieStatus === 'error' && (
            <p className="text-red-400 text-xs mt-3">Something went wrong linking your Bungie account. Please try again.</p>
          )}
        </div>

        {/* Danger Zone — Delete Account */}
        <DeleteAccountSection />

      </div>
    </main>
  )
}

function DeleteAccountSection() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0 = hidden, 1 = confirm prompt, 2 = deleting
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setStep(2)
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      logout()
      navigate('/')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep(1)
    }
  }

  return (
    <div className="mt-6 border border-red-900 rounded-xl p-6 bg-red-950/20">
      <h2 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h2>
      <p className="text-brand-muted text-xs mb-4">
        Permanently deletes your account, profile, clips, and all connections. This cannot be undone.
      </p>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {step === 0 && (
        <button type="button" onClick={() => setStep(1)}
          className="border border-red-700 text-red-400 hover:bg-red-900/30 text-sm px-4 py-2 rounded transition-colors">
          Delete My Account
        </button>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-red-300 text-sm font-medium">Are you sure? This is permanent and cannot be reversed.</p>
          <div className="flex gap-3">
            <button type="button" onClick={handleDelete}
              className="bg-red-700 hover:bg-red-600 text-white text-sm px-5 py-2 rounded font-semibold transition-colors">
              Yes, delete my account
            </button>
            <button type="button" onClick={() => setStep(0)}
              className="bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text text-sm px-5 py-2 rounded transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <p className="text-brand-muted text-sm">Deleting your account...</p>
      )}
    </div>
  )
}
