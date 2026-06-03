import { useState } from 'react'
import { ALL_CONTRACTS, getContractFaction, CONTRACT_FACTIONS } from '../data/contracts'

export default function ContractPicker({ selected, onChange }) {
  const [search, setSearch] = useState('')

  const filtered = search.length > 0
    ? ALL_CONTRACTS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) && c.name !== selected
      )
    : []

  const selectedData = selected ? getContractFaction(selected) : null

  return (
    <div>
      {/* Current selection */}
      {selected && selectedData && (
        <div className={`flex items-center justify-between border rounded-xl px-4 py-3 mb-3 ${selectedData.color}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">
              {selectedData.faction}
            </p>
            <p className="text-sm font-medium">{selected}</p>
          </div>
          <button type="button" onClick={() => { onChange(''); setSearch('') }}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
            ✕ Clear
          </button>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={selected ? 'Search to change contract...' : 'Search for your active contract...'}
          className="w-full bg-brand-card border border-brand-border rounded px-4 py-2.5 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent transition-colors text-sm"
        />
        {filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-brand-surface border border-brand-border rounded-lg shadow-xl max-h-56 overflow-y-auto">
            {filtered.map(({ name, faction }) => {
              const factionData = CONTRACT_FACTIONS[faction]
              return (
                <button key={name} type="button"
                  onClick={() => { onChange(name); setSearch('') }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-card transition-colors flex items-center justify-between gap-3">
                  <span className="text-brand-text">{name}</span>
                  <span className={`text-xs border rounded-full px-2 py-0.5 flex-shrink-0 ${factionData.badge}`}>
                    {faction}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Browse by faction if no search */}
      {!search && !selected && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(CONTRACT_FACTIONS).map(([faction, data]) => (
            <button key={faction} type="button"
              onClick={() => setSearch(faction)}
              className={`text-xs border rounded-full px-3 py-1 transition-colors hover:opacity-80 ${data.badge}`}>
              {faction}
            </button>
          ))}
        </div>
      )}

      <p className="text-brand-muted text-xs mt-2">
        Select the contract you're currently working on · Remove it when you're done
      </p>
    </div>
  )
}
