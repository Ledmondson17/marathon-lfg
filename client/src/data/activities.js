export const ACTIVITIES = [
  {
    id: 'competitive',
    label: 'Competitive / Ranked',
    description: 'PVP-focused. This player is here to climb the ranks and win. Expect callouts, coordination, and a serious mindset every session.',
    color: 'bg-red-900/40 border-red-600 text-red-300',
    badge: 'bg-red-900/40 border-red-600 text-red-300',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'PVP & PVE are both on the table. This player just wants to have fun — no pressure, good vibes, and flexible on what the session looks like.',
    color: 'bg-green-900/40 border-green-600 text-green-300',
    badge: 'bg-green-900/40 border-green-600 text-green-300',
  },
  {
    id: 'pve',
    label: 'PVE Focus',
    description: 'Cooperative play over competition. This player prefers taking on the environment, completing objectives, and working as a team rather than hunting other runners.',
    color: 'bg-blue-900/40 border-blue-600 text-blue-300',
    badge: 'bg-blue-900/40 border-blue-600 text-blue-300',
  },
  {
    id: 'lore',
    label: 'Codex / Lore',
    description: "Mostly here for the story. This player is exploring the world of Marathon — collecting Codex entries, uncovering lore, and piecing together the universe's history.",
    color: 'bg-yellow-900/40 border-yellow-600 text-yellow-300',
    badge: 'bg-yellow-900/40 border-yellow-600 text-yellow-300',
  },
]

export function getActivity(id) {
  return ACTIVITIES.find(a => a.id === id) || null
}
