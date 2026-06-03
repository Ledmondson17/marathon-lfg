// All playable maps in Marathon
// Night Marsh is the Season 2 map

export const MAPS = [
  { id: 'Cryo Archive',  label: 'Cryo Archive',  color: 'bg-cyan-900/40 border-cyan-600 text-cyan-300' },
  { id: 'Dire Marsh',   label: 'Dire Marsh',    color: 'bg-emerald-900/40 border-emerald-600 text-emerald-300' },
  { id: 'Night Marsh',  label: 'Night Marsh',   color: 'bg-indigo-900/40 border-indigo-600 text-indigo-300', badge: 'S2 NEW' },
  { id: 'Outpost',      label: 'Outpost',       color: 'bg-amber-900/40 border-amber-600 text-amber-300' },
  { id: 'Perimeter',    label: 'Perimeter',     color: 'bg-rose-900/40 border-rose-600 text-rose-300' },
]

export function getMap(id) {
  return MAPS.find(m => m.id === id) || null
}
