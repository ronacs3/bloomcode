import type { GeneId } from './genes';

/* ---------------- Weather ---------------- */

export type WeatherId = 'sunny' | 'rain' | 'thunderstorm' | 'snow' | 'heatwave' | 'fullmoon' | 'meteor';

export interface Weather {
  id: WeatherId;
  name: string;
  icon: string;
  weight: number;
  autoWater: boolean;
  growthMul: number;
  gene?: GeneId;
  description: string;
}

export const WEATHERS: Record<WeatherId, Weather> = {
  sunny: { id: 'sunny', name: 'Sunny', icon: '☀️', weight: 32, autoWater: false, growthMul: 1, description: 'Clear skies — a perfect farming day.' },
  rain: { id: 'rain', name: 'Rain', icon: '🌧️', weight: 20, autoWater: true, growthMul: 1, description: 'All crops are watered automatically.' },
  thunderstorm: { id: 'thunderstorm', name: 'Thunderstorm', icon: '⛈️', weight: 11, autoWater: true, growthMul: 1, gene: 'thunder', description: 'Auto-waters. Electric mutations crackle in the air!' },
  snow: { id: 'snow', name: 'Snow', icon: '❄️', weight: 10, autoWater: false, growthMul: 0.5, gene: 'frost', description: 'Growth slows down. Frost mutations appear.' },
  heatwave: { id: 'heatwave', name: 'Heatwave', icon: '🔥', weight: 10, autoWater: false, growthMul: 1.5, gene: 'fire', description: 'Watered crops grow fast. Fiery mutations bloom.' },
  fullmoon: { id: 'fullmoon', name: 'Full Moon', icon: '🌕', weight: 10, autoWater: false, growthMul: 1, gene: 'moon', description: 'Moonlight awakens lunar genes.' },
  meteor: { id: 'meteor', name: 'Meteor Shower', icon: '☄️', weight: 7, autoWater: false, growthMul: 1, gene: 'star', description: 'Stardust falls! Cosmic mutations are possible.' },
};

export const WEATHER_IDS = Object.keys(WEATHERS) as WeatherId[];

export function rollWeather(): WeatherId {
  const total = WEATHER_IDS.reduce((s, id) => s + WEATHERS[id].weight, 0);
  let r = Math.random() * total;
  for (const id of WEATHER_IDS) {
    r -= WEATHERS[id].weight;
    if (r <= 0) return id;
  }
  return 'sunny';
}

/* ---------------- Soil ---------------- */

export type SoilId = 'normal' | 'fertile' | 'volcanic' | 'frost' | 'crystal';

export interface Soil {
  id: SoilId;
  name: string;
  icon: string;
  price: number;
  growthMul: number;
  gene?: GeneId;
  description: string;
}

export const SOILS: Record<SoilId, Soil> = {
  normal: { id: 'normal', name: 'Farm Soil', icon: '🟫', price: 0, growthMul: 1, description: 'Plain, honest dirt.' },
  fertile: { id: 'fertile', name: 'Fertile Soil', icon: '🌱', price: 60, growthMul: 1.5, description: 'Crops grow 50% faster.' },
  volcanic: { id: 'volcanic', name: 'Volcanic Soil', icon: '🌋', price: 140, growthMul: 1, gene: 'fire', description: 'Hot ash. Triggers fire mutations.' },
  frost: { id: 'frost', name: 'Frost Soil', icon: '🧊', price: 140, growthMul: 0.9, gene: 'frost', description: 'Permafrost. Triggers frost mutations.' },
  crystal: { id: 'crystal', name: 'Crystal Soil', icon: '💎', price: 320, growthMul: 1, gene: 'crystal', description: 'Glittering geode dust. Triggers crystal mutations.' },
};

export const SOIL_KIT_IDS: SoilId[] = ['fertile', 'volcanic', 'frost', 'crystal'];

/* ---------------- Farm ---------------- */

export const GRID_COLS = 5;
export const GRID_SIZE = 20;
export const START_UNLOCKED = 9;

/** Plots that start unlocked (a 3×3 block in the middle-left of the field). */
export const START_PLOTS = [1, 2, 3, 6, 7, 8, 11, 12, 13];

export const plotUnlockCost = (unlockedCount: number) =>
  Math.round((60 * Math.pow(1.38, unlockedCount - START_UNLOCKED)) / 10) * 10;

export const SPRINKLER_PRICE = 900;
