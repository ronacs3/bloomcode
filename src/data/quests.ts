import type { GeneId } from './genes';
import type { SoilId } from './world';

export interface GameStats {
  tilled: number;
  planted: number;
  watered: number;
  harvested: number;
  sold: number;
  bred: number;
  extracted: number;
  farmMutations: number;
  days: number;
  genes: number;
}

export const EMPTY_STATS: GameStats = {
  tilled: 0, planted: 0, watered: 0, harvested: 0, sold: 0, bred: 0, extracted: 0, farmMutations: 0, days: 0, genes: 0,
};

export interface QuestContext {
  stats: GameStats;
  discovered: number;
  epicFound: boolean;
  plots: number;
}

export interface QuestReward {
  coin?: number;
  gp?: number;
  seeds?: Record<string, number>;
  genes?: Partial<Record<GeneId, number>>;
  soils?: Partial<Record<SoilId, number>>;
}

export interface Quest {
  id: string;
  icon: string;
  title: string;
  description: string;
  target: number;
  progress: (c: QuestContext) => number;
  reward: QuestReward;
}

export const QUESTS: Quest[] = [
  { id: 'till', icon: '⛏️', title: 'Break Ground', description: 'Till 4 plots with the Hoe', target: 4, progress: (c) => c.stats.tilled, reward: { coin: 25 } },
  { id: 'plant', icon: '🌱', title: 'First Seeds', description: 'Plant 4 seeds', target: 4, progress: (c) => c.stats.planted, reward: { coin: 25 } },
  { id: 'water', icon: '💧', title: 'Thirsty Sprouts', description: 'Water 4 crops', target: 4, progress: (c) => c.stats.watered, reward: { coin: 20 } },
  { id: 'sleep', icon: '🌙', title: 'Sweet Dreams', description: 'Sleep to start a new day', target: 1, progress: (c) => c.stats.days, reward: { seeds: { strawberry: 2, sunflower: 2 } } },
  { id: 'harvest', icon: '🧺', title: 'Harvest Time', description: 'Harvest 4 crops', target: 4, progress: (c) => c.stats.harvested, reward: { coin: 40 } },
  { id: 'breed', icon: '🧬', title: 'Mad Scientist', description: 'Breed two crops in the Gene Lab', target: 1, progress: (c) => c.stats.bred, reward: { gp: 10 } },
  { id: 'dex6', icon: '📖', title: 'New Life', description: 'Discover 6 species', target: 6, progress: (c) => c.discovered, reward: { coin: 60 } },
  { id: 'sell', icon: '💰', title: 'Market Day', description: 'Sell 5 crops at the shop', target: 5, progress: (c) => c.stats.sold, reward: { coin: 40 } },
  { id: 'plots', icon: '🗺️', title: 'Expansion', description: 'Own 10 farm plots', target: 10, progress: (c) => c.plots, reward: { soils: { fertile: 2 } } },
  { id: 'gene', icon: '🧪', title: 'Gene Hunter', description: 'Collect a gene sample', target: 1, progress: (c) => c.stats.genes, reward: { gp: 10 } },
  { id: 'mutate', icon: '⚡', title: 'Freak of Nature', description: 'Trigger a mutation while harvesting', target: 1, progress: (c) => c.stats.farmMutations, reward: { gp: 15 } },
  { id: 'dex12', icon: '🔬', title: 'Field Researcher', description: 'Discover 12 species', target: 12, progress: (c) => c.discovered, reward: { coin: 200, soils: { volcanic: 1, frost: 1 } } },
  { id: 'epic', icon: '💜', title: 'Epic Find', description: 'Discover an Epic species', target: 1, progress: (c) => (c.epicFound ? 1 : 0), reward: { gp: 30 } },
  { id: 'dex20', icon: '🏆', title: 'Gene Archivist', description: 'Discover 20 species', target: 20, progress: (c) => c.discovered, reward: { coin: 500, soils: { crystal: 1 } } },
  { id: 'dex30', icon: '👑', title: 'Master Geneticist', description: 'Complete the GeneDex', target: 30, progress: (c) => c.discovered, reward: { coin: 3000, gp: 100 } },
];
