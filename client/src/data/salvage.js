// Full list of salvage items in Marathon, sourced from tauceti.gg
// Grouped by rarity tier for display purposes

export const SALVAGE_TIERS = {
  'Exotic': [
    'Compiler Ganglion',
    'Alien Alloy',
    'Biogenic Alloy',
    'Hazard Capsule',
    'Synapse Cube',
  ],
  'Rare': [
    'Ballistic Turbine',
    'Biofilament',
    'Biolens Seed',
    'Coherence Drive',
    'Enzyme Replicator',
    'Liquid Explosive',
    'Neural Insulation',
    'Papaver Bloom',
    'Predictive Framework',
    'Reflex Coil',
    'Shell ID',
  ],
  'Uncommon': [
    'Amygdala Drive',
    'Anomalous Wire',
    'Biomata Node',
    'Biomata Resin',
    'Cetinite Rods',
    'Dynamic Lens',
    'Nanozymes',
    'Neurochem Pack',
    'Paradox Circuit',
    'Polymer Wire',
    'Steel Rods',
    'Sterilized Biostripping',
    'Tachyon Filament',
    'Tarax Seed',
    'Thoughtwave Lens',
    'UESC Obedience Matrix',
    'Volatile Compounds',
  ],
  'Common': [
    'Aluminum Rods',
    'Basic Xerogel',
    'Carbon Wire',
    'Deimosite Rods',
    'Dermachem Pack',
    'Drone Node',
    'Drone Resin',
    'Dynamic Compounds',
    'Epoxy Resin',
    'Fractal Circuit',
    'Hydrocarbon Rubber',
    'Nanocomposites',
    'Plastic Filament',
    'Putty Explosive',
    'Reclaimed Biostripping',
    'Sparkleaf',
    'Storage Drive',
    'Surveillance Lens',
  ],
  'Unstable': [
    'Altered Wire',
    'Data Card',
    'Unstable Biomass',
    'Unstable Diode',
    'Unstable Gel',
    'Unstable Gunmetal',
    'Unstable Lead',
    'Weapon Parts',
  ],
}

// Flat list for search/filter use
export const ALL_SALVAGE = Object.values(SALVAGE_TIERS).flat()

// Tier color styles
export const TIER_COLORS = {
  Exotic:   'bg-yellow-900/40 border-yellow-600 text-yellow-300',
  Rare:     'bg-purple-900/40 border-purple-600 text-purple-300',
  Uncommon: 'bg-blue-900/40 border-blue-600 text-blue-300',
  Common:   'bg-zinc-800 border-zinc-600 text-zinc-300',
  Unstable: 'bg-red-900/40 border-red-700 text-red-300',
}

// Get the tier for a given salvage item
export function getSalvageTier(item) {
  return Object.entries(SALVAGE_TIERS).find(([, items]) => items.includes(item))?.[0] || 'Common'
}
