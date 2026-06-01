import { useState } from 'react'
import { ALL_SALVAGE, getSalvageTier, TIER_COLORS } from '../data/salvage'

const MAX_SALVAGE = 6

export default function SalvagePicker({ selected, onChange }) {
  const [search, setSearch] = useState('')

  const filtered = search.length > 0
    ? ALL_SALVAGE.filter(s => s.toLowerCase().includes(search.toLowerCase()) && !selected.includes(s))
    : []

  const addItem = (item) => {
    if (selected.includes(item) || selected.length >= MAX_SALVAGE) return
    onChange([...selected, item])
    setSearch('')
  }

  const removeItem = (item) => {
    onChange(selected.filter(s => s !== item))
  }

  return (
    <div>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map(item => {
            const tier = getSalvageTier(item)
            return (
              <span key={item} className={`flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-medium ${TIER_COLORS[tier]}`}>
                {item}
                <button type="button" onClick={() => removeItem(item)}
                  className="hover:opacity-70 transition-opacity font-bold">
                  ✕
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search input */}
      {selected.length < MAX_SALVAGE && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search salvage to add..."
            className="w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors text-sm"
          />
          {filtered.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-brand-surface border border-brand-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {filtered.map(item => {
                const tier = getSalvageTier(item)
                return (
                  <button key={item} type="button" onClick={() => addItem(item)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-card transition-colors flex items-center justify-between gap-2">
                    <span className="text-brand-text">{item}</span>
                    <span className={`text-xs border rounded-full px-2 py-0.5 ${TIER_COLORS[tier]}`}>{tier}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
      <p className="text-brand-muted text-xs mt-1.5">{selected.length}/{MAX_SALVAGE} items · Remove tags once you've found what you need</p>
    </div>
  )
}
