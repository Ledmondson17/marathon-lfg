// All documented Marathon contracts organized by faction
// Each faction uses its in-game brand color
// Cross-referenced against marathondb.gg — 81 total Season 1 contracts

export const CONTRACT_FACTIONS = {
  CyberAcme: {
    color: 'bg-green-900/40 border-green-500 text-green-300',
    badge: 'bg-green-900/40 border-green-500 text-green-300',
    dot: 'bg-green-400',
    contracts: [
      "Can't Survive: Can't Fight I",
      "Can't Survive: Can't Fight II",
      'Trash to Treasure',
      'Trash to Treasure II',
      'Best of the Bots',
      'Deconstructed I',
      'Emergent Opportunities I',
      'Instant Transfer I',
      'Instant Transfer',
      'Build Meets Craft I',
      "No Weapon: Can't Fight I",
      'Shell Games I',
      'Big Robot? Still Robot',
      'Prime Time',
      "A Runner Can't Adapt; They Can't Fight",
      'Target Acquired',
      'Return on Investment',
      'Welcome to Tau Ceti 1/2',
      'Introducing: NuCaloric',
      'Introducing: Traxus',
      'Introducing: MIDA',
      'Introducing: Arachne',
      'Introducing: Sekiguchi',
    ],
  },
  NuCaloric: {
    color: 'bg-pink-900/40 border-pink-500 text-pink-300',
    badge: 'bg-pink-900/40 border-pink-500 text-pink-300',
    dot: 'bg-pink-400',
    contracts: [
      'Compound Solutions I',
      'Assault with Battery I',
      'Shelf-Stable I',
      'Nano Metrics I',
      'Planted Evidence I',
      'Contained Analysis I',
      'Sterile Environment I',
      'Growth Mindset I',
      "You're Rubber, I'm Glue",
      'Chemical Peel',
      'Assault with Battery',
      'Ecological Niche',
      'One Thousand Thousand Slimy Things I',
      'Data Mapping',
      'Data Reconstruction 1/3',
      'Survival Directive',
    ],
  },
  Traxus: {
    color: 'bg-orange-900/40 border-orange-500 text-orange-300',
    badge: 'bg-orange-900/40 border-orange-500 text-orange-300',
    dot: 'bg-orange-400',
    contracts: [
      'Targeted Strategy I',
      'Asset Recovery I',
      'Value Proposition I',
      'Field Testing: Precision Rifle I',
      'Field Testing: Assault Rifles I',
      'Sustainable Reuse I',
      'Raw Materials I',
      'Field Testing: SMGs I',
      'Inventory Control I',
      'Arms Dealer',
      'Equitable Distribution 1/4',
      'Cutthroat Competition',
    ],
  },
  MIDA: {
    color: 'bg-purple-900/40 border-purple-500 text-purple-300',
    badge: 'bg-purple-900/40 border-purple-500 text-purple-300',
    dot: 'bg-purple-400',
    contracts: [
      'Unlock/Unleash I',
      'Reclaim/Resist I',
      'Spark/Ignite I',
      'Justice/Revenge I',
      'Escape/Defy I',
      'Stand/Fight I',
      'Consume/Control I',
      'Us/Them I',
      'Smash/Grab I',
      'Murder/Take',
      'Consume/Control',
      'Blow/Up',
      'Rip/Tear',
      'Fire/Fuel',
      'Heads/Tails',
      'Truth/Lies',
      'Protect/Destroy 1/5',
      'Order/Chaos',
    ],
  },
  Arachne: {
    color: 'bg-red-900/40 border-red-500 text-red-300',
    badge: 'bg-red-900/40 border-red-500 text-red-300',
    dot: 'bg-red-400',
    contracts: [
      'Technologies of Violence I',
      'Ancient Relics I',
      'Brutal Hymn I',
      'Spoils of War I',
      'Life-Death Equation I',
      'Fatal Instrument I',
      'Colony Remains I',
      'Exhumation I',
      'Zero Sum Game',
      'Killing in the Name Of',
      'Climbing the Ranks',
      'Best in Class',
      'Finisher Protocol',
      'The Fleeting Grave',
    ],
  },
  Sekiguchi: {
    color: 'bg-yellow-900/40 border-yellow-500 text-yellow-300',
    badge: 'bg-yellow-900/40 border-yellow-500 text-yellow-300',
    dot: 'bg-yellow-400',
    contracts: [
      'Friction II',
      'Cutthroat Competition',
      'Baseline Calibration',
    ],
  },
  // Season 2 — Night Marsh limited-time contracts
  // Contract names will be added as they are documented
  Limited: {
    color: 'bg-indigo-900/40 border-indigo-500 text-indigo-300',
    badge: 'bg-indigo-900/40 border-indigo-500 text-indigo-300',
    dot: 'bg-indigo-400',
    contracts: [
      // Night Marsh S2 limited contracts — names to be added
    ],
  },
}

// Flat list of all contracts for search
export const ALL_CONTRACTS = Object.entries(CONTRACT_FACTIONS).flatMap(
  ([faction, data]) => data.contracts.map(name => ({ name, faction }))
)

// Get faction data for a contract name
export function getContractFaction(contractName) {
  const entry = ALL_CONTRACTS.find(c => c.name === contractName)
  return entry ? { faction: entry.faction, ...CONTRACT_FACTIONS[entry.faction] } : null
}
