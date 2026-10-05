export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_INFO: Record<Rarity, { label: string; color: string; gp: number }> = {
  common: { label: 'Phổ biến', color: '#9aa5b1', gp: 5 },
  uncommon: { label: 'Ít gặp', color: '#5cc96b', gp: 10 },
  rare: { label: 'Hiếm', color: '#4aa8ff', gp: 20 },
  epic: { label: 'Sử thi', color: '#b46cff', gp: 35 },
  legendary: { label: 'Huyền thoại', color: '#ffb020', gp: 60 },
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
  solar: { id: 'solar', name: 'Gene Mặt Trời', icon: '☀️', color: '#ffc845', description: 'Năng lượng ấm áp từ những cây ưa nắng.' },
  moon: { id: 'moon', name: 'Gene Mặt Trăng', icon: '🌙', color: '#a78bfa', description: 'Ánh sáng dịu nhẹ chỉ thức giấc vào ban đêm.' },
  thunder: { id: 'thunder', name: 'Gene Sấm Sét', icon: '⚡', color: '#38bdf8', description: 'Lách tách tia điện tích trữ bên trong.' },
  frost: { id: 'frost', name: 'Gene Băng Giá', icon: '❄️', color: '#7dd3fc', description: 'Lạnh buốt khi chạm vào. Không bao giờ tan.' },
  fire: { id: 'fire', name: 'Gene Lửa', icon: '🔥', color: '#fb7a3c', description: 'Nóng đến mức sưởi ấm cả đất xung quanh.' },
  star: { id: 'star', name: 'Gene Tinh Tú', icon: '⭐', color: '#818cf8', description: 'Bụi sao rơi xuống từ trận mưa sao băng.' },
  crystal: { id: 'crystal', name: 'Gene Pha Lê', icon: '💎', color: '#d8b4fe', description: 'Một chuỗi gene hoàn hảo, lấp lánh.' },
};

export const GENE_IDS = Object.keys(GENES) as GeneId[];
