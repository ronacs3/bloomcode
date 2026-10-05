export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_INFO: Record<Rarity, { label: string; color: string; gp: number }> = {
  common: { label: 'Common', color: '#9aa5b1', gp: 5 },
  uncommon: { label: 'Uncommon', color: '#5cc96b', gp: 10 },
  rare: { label: 'Rare', color: '#4aa8ff', gp: 20 },
  epic: { label: 'Epic', color: '#b46cff', gp: 35 },
  legendary: { label: 'Legendary', color: '#ffb020', gp: 60 },
};

export interface PlantGene {
  species: string;
  growth: number;
  sweetness: number;
  size: number;
  resistance: number;
  colorGene: string;
  specialGene?: string;
  rarity: Rarity;
}

export type GeneId = 'solar' | 'moon' | 'thunder' | 'frost' | 'fire' | 'star' | 'crystal';

export interface GeneSample {
  id: GeneId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const GENES: Record<GeneId, GeneSample> = {
  solar: { id: 'solar', name: 'Solar Gene', icon: '☀️', color: '#ffc845', description: 'Warm, bright energy from sun-loving plants.' },
  moon: { id: 'moon', name: 'Moon Gene', icon: '🌙', color: '#a78bfa', description: 'A soft glow that only awakens at night.' },
  thunder: { id: 'thunder', name: 'Thunder Gene', icon: '⚡', color: '#38bdf8', description: 'Crackles with stored lightning.' },
  frost: { id: 'frost', name: 'Frost Gene', icon: '❄️', color: '#7dd3fc', description: 'Cold to the touch. Never melts.' },
  fire: { id: 'fire', name: 'Fire Gene', icon: '🔥', color: '#fb7a3c', description: 'Hot enough to warm the soil around it.' },
  star: { id: 'star', name: 'Star Gene', icon: '⭐', color: '#818cf8', description: 'Stardust fallen from a meteor shower.' },
  crystal: { id: 'crystal', name: 'Crystal Gene', icon: '💎', color: '#d8b4fe', description: 'A perfectly ordered, shimmering sequence.' },
};

export const GENE_IDS = Object.keys(GENES) as GeneId[];
