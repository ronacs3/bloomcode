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
  sunny: { id: 'sunny', name: 'Nắng đẹp', icon: '☀️', weight: 32, autoWater: false, growthMul: 1, description: 'Trời quang mây tạnh — ngày lý tưởng để làm vườn.' },
  rain: { id: 'rain', name: 'Mưa', icon: '🌧️', weight: 20, autoWater: true, growthMul: 1, description: 'Mọi cây trồng đều được tưới tự động.' },
  thunderstorm: { id: 'thunderstorm', name: 'Giông bão', icon: '⛈️', weight: 11, autoWater: true, growthMul: 1, gene: 'thunder', description: 'Tự tưới cây. Đột biến điện lách tách trong không khí!' },
  snow: { id: 'snow', name: 'Tuyết rơi', icon: '❄️', weight: 10, autoWater: false, growthMul: 0.5, gene: 'frost', description: 'Cây lớn chậm lại. Đột biến băng giá xuất hiện.' },
  heatwave: { id: 'heatwave', name: 'Nắng nóng', icon: '🔥', weight: 10, autoWater: false, growthMul: 1.5, gene: 'fire', description: 'Cây được tưới sẽ lớn rất nhanh. Đột biến lửa nở rộ.' },
  fullmoon: { id: 'fullmoon', name: 'Trăng tròn', icon: '🌕', weight: 10, autoWater: false, growthMul: 1, gene: 'moon', description: 'Ánh trăng đánh thức các gene mặt trăng.' },
  meteor: { id: 'meteor', name: 'Mưa sao băng', icon: '☄️', weight: 7, autoWater: false, growthMul: 1, gene: 'star', description: 'Bụi sao rơi xuống! Có thể xảy ra đột biến vũ trụ.' },
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
  short: string;
  icon: string;
  price: number;
  growthMul: number;
  gene?: GeneId;
  description: string;
}

export const SOILS: Record<SoilId, Soil> = {
  normal: { id: 'normal', name: 'Đất thường', short: 'Thường', icon: '🟫', price: 0, growthMul: 1, description: 'Đất ruộng bình thường, chân chất.' },
  fertile: { id: 'fertile', name: 'Đất màu mỡ', short: 'Màu mỡ', icon: '🌱', price: 60, growthMul: 1.5, description: 'Cây lớn nhanh hơn 50%.' },
  volcanic: { id: 'volcanic', name: 'Đất núi lửa', short: 'Núi lửa', icon: '🌋', price: 140, growthMul: 1, gene: 'fire', description: 'Tro nóng. Kích hoạt đột biến lửa.' },
  frost: { id: 'frost', name: 'Đất băng', short: 'Băng', icon: '🧊', price: 140, growthMul: 0.9, gene: 'frost', description: 'Đất đóng băng vĩnh cửu. Kích hoạt đột biến băng giá.' },
  crystal: { id: 'crystal', name: 'Đất pha lê', short: 'Pha lê', icon: '💎', price: 320, growthMul: 1, gene: 'crystal', description: 'Bụi đá quý lấp lánh. Kích hoạt đột biến pha lê.' },
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
