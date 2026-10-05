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
  { id: 'till', icon: '⛏️', title: 'Vỡ Đất', description: 'Dùng cuốc xới 4 ô đất', target: 4, progress: (c) => c.stats.tilled, reward: { coin: 25 } },
  { id: 'plant', icon: '🌱', title: 'Hạt Giống Đầu Tiên', description: 'Gieo 4 hạt giống', target: 4, progress: (c) => c.stats.planted, reward: { coin: 25 } },
  { id: 'water', icon: '💧', title: 'Mầm Khát Nước', description: 'Tưới nước cho 4 cây', target: 4, progress: (c) => c.stats.watered, reward: { coin: 20 } },
  { id: 'sleep', icon: '🌙', title: 'Ngủ Ngon', description: 'Đi ngủ để sang ngày mới', target: 1, progress: (c) => c.stats.days, reward: { seeds: { strawberry: 2, sunflower: 2 } } },
  { id: 'harvest', icon: '🧺', title: 'Mùa Thu Hoạch', description: 'Thu hoạch 4 nông sản', target: 4, progress: (c) => c.stats.harvested, reward: { coin: 40 } },
  { id: 'breed', icon: '🧬', title: 'Nhà Khoa Học Điên', description: 'Lai hai nông sản trong Phòng Gene', target: 1, progress: (c) => c.stats.bred, reward: { gp: 10 } },
  { id: 'dex6', icon: '📖', title: 'Sự Sống Mới', description: 'Khám phá 6 loài', target: 6, progress: (c) => c.discovered, reward: { coin: 60 } },
  { id: 'sell', icon: '💰', title: 'Ngày Phố Chợ', description: 'Bán 5 nông sản ở cửa hàng', target: 5, progress: (c) => c.stats.sold, reward: { coin: 40 } },
  { id: 'plots', icon: '🗺️', title: 'Mở Rộng', description: 'Sở hữu 10 ô đất', target: 10, progress: (c) => c.plots, reward: { soils: { fertile: 2 } } },
  { id: 'gene', icon: '🧪', title: 'Thợ Săn Gene', description: 'Thu thập một mẫu gene', target: 1, progress: (c) => c.stats.genes, reward: { gp: 10 } },
  { id: 'mutate', icon: '⚡', title: 'Kỳ Quan Thiên Nhiên', description: 'Gây đột biến khi thu hoạch', target: 1, progress: (c) => c.stats.farmMutations, reward: { gp: 15 } },
  { id: 'dex12', icon: '🔬', title: 'Nhà Nghiên Cứu', description: 'Khám phá 12 loài', target: 12, progress: (c) => c.discovered, reward: { coin: 200, soils: { volcanic: 1, frost: 1 } } },
  { id: 'epic', icon: '💜', title: 'Phát Hiện Sử Thi', description: 'Khám phá một loài Sử thi', target: 1, progress: (c) => (c.epicFound ? 1 : 0), reward: { gp: 30 } },
  { id: 'dex20', icon: '🏆', title: 'Thủ Thư Gene', description: 'Khám phá 20 loài', target: 20, progress: (c) => c.discovered, reward: { coin: 500, soils: { crystal: 1 } } },
  { id: 'dex30', icon: '👑', title: 'Bậc Thầy Di Truyền', description: 'Hoàn thành GeneDex', target: 30, progress: (c) => c.discovered, reward: { coin: 3000, gp: 100 } },
];
