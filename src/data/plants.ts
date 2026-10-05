import type { GeneId, Rarity } from './genes';

export type { Rarity } from './genes';

export type Family = 'berry' | 'flower' | 'grain' | 'fruit' | 'root' | 'vine' | 'fungus';

export const FAMILY_LABEL: Record<Family, string> = {
  berry: 'quả mọng',
  flower: 'hoa',
  grain: 'ngũ cốc',
  fruit: 'quả',
  root: 'củ',
  vine: 'dây leo',
  fungus: 'nấm',
};

export interface PlantLook {
  /** CSS filter applied to the base emoji to create a mutated colourway. */
  filter?: string;
  /** Glow colour around the plant. */
  aura?: string;
  /** Small emoji badge shown at the corner of the plant. */
  badge?: string;
  /** Animated rainbow hue cycling (legendary). */
  rainbow?: boolean;
}

export interface PlantStats {
  growth: number;
  sweetness: number;
  size: number;
  resistance: number;
}

export interface PlantSpecies {
  id: string;
  dex: number;
  name: string;
  rarity: Rarity;
  family: Family;
  icon: string;
  look?: PlantLook;
  stats: PlantStats;
  colorGene: string;
  /** Days of watered growth to mature. */
  days: number;
  /** Price in the seed shop (only for buyable species). */
  seedPrice?: number;
  /** Number of GeneDex discoveries required before the seed appears in the shop. */
  unlockAt?: number;
  cropPrice: number;
  /** Gene sample produced when the crop is extracted in the Gene Lab. */
  gene?: GeneId;
  description: string;
  hint: string;
}

const P = (p: PlantSpecies) => p;

export const PLANTS: Record<string, PlantSpecies> = {
  /* ---------- Starter crops ---------- */
  strawberry: P({
    id: 'strawberry', dex: 1, name: 'Dâu Tây', rarity: 'common', family: 'berry', icon: '🍓',
    stats: { growth: 70, sweetness: 85, size: 40, resistance: 30 }, colorGene: 'ĐỎ',
    days: 2, seedPrice: 10, cropPrice: 28,
    description: 'Quả mọng đỏ ngọt lịm. Gene của nó nổi tiếng là dễ biến đổi — hoàn hảo để thí nghiệm.',
    hint: 'Nông dân nào cũng bắt đầu với loại quả đỏ ngọt này.',
  }),
  sunflower: P({
    id: 'sunflower', dex: 2, name: 'Hướng Dương', rarity: 'common', family: 'flower', icon: '🌻',
    stats: { growth: 60, sweetness: 10, size: 80, resistance: 50 }, colorGene: 'VÀNG',
    days: 3, seedPrice: 15, cropPrice: 45, gene: 'solar',
    description: 'Luôn hướng về mặt trời. Tách gene sẽ thu được Gene Mặt Trời.',
    hint: 'Loài hoa cao lớn luôn dõi theo mặt trời.',
  }),
  corn: P({
    id: 'corn', dex: 3, name: 'Ngô', rarity: 'common', family: 'grain', icon: '🌽',
    stats: { growth: 50, sweetness: 40, size: 60, resistance: 60 }, colorGene: 'VÀNG',
    days: 3, seedPrice: 12, cropPrice: 38,
    description: 'Cây lương thực kinh điển, phản ứng mạnh với nhiệt độ.',
    hint: 'Hạt vàng óng trên thân cây cao.',
  }),
  tomato: P({
    id: 'tomato', dex: 4, name: 'Cà Chua', rarity: 'common', family: 'fruit', icon: '🍅',
    stats: { growth: 65, sweetness: 30, size: 50, resistance: 40 }, colorGene: 'ĐỎ',
    days: 2, seedPrice: 10, cropPrice: 30,
    description: 'Quả đỏ mọng nước, hay bị nhầm là rau.',
    hint: 'Là quả hay là rau? Chẳng ai thống nhất được.',
  }),
  carrot: P({
    id: 'carrot', dex: 5, name: 'Cà Rốt', rarity: 'common', family: 'root', icon: '🥕',
    stats: { growth: 55, sweetness: 50, size: 30, resistance: 70 }, colorGene: 'CAM',
    days: 2, seedPrice: 8, cropPrice: 24,
    description: 'Củ cam giòn rụm. Đủ cứng cáp để sống trên mọi loại đất.',
    hint: 'Một loại củ màu cam giòn tan.',
  }),
  pumpkin: P({
    id: 'pumpkin', dex: 6, name: 'Bí Ngô', rarity: 'common', family: 'vine', icon: '🎃',
    stats: { growth: 35, sweetness: 45, size: 95, resistance: 65 }, colorGene: 'CAM',
    days: 4, seedPrice: 30, unlockAt: 7, cropPrice: 100,
    description: 'Lớn chậm nhưng to và rất có giá.',
    hint: 'Mở bán trong cửa hàng sau 7 lần khám phá.',
  }),
  grape: P({
    id: 'grape', dex: 7, name: 'Nho', rarity: 'common', family: 'berry', icon: '🍇',
    stats: { growth: 60, sweetness: 80, size: 30, resistance: 40 }, colorGene: 'TÍM',
    days: 3, seedPrice: 25, unlockAt: 11, cropPrice: 75,
    description: 'Chùm quả tím với bộ gene sâu sắc, phức tạp.',
    hint: 'Mở bán trong cửa hàng sau 11 lần khám phá.',
  }),
  mushroom: P({
    id: 'mushroom', dex: 8, name: 'Nấm', rarity: 'common', family: 'fungus', icon: '🍄',
    stats: { growth: 75, sweetness: 20, size: 30, resistance: 55 }, colorGene: 'ĐỎ',
    days: 2, seedPrice: 20, unlockAt: 15, cropPrice: 60,
    description: 'Phát triển tốt trong bóng tối. Rất nhạy cảm với ánh trăng.',
    hint: 'Mở bán trong cửa hàng sau 15 lần khám phá.',
  }),

  /* ---------- Simple hybrids ---------- */
  sunberry: P({
    id: 'sunberry', dex: 9, name: 'Dâu Mặt Trời', rarity: 'uncommon', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(38deg) saturate(1.6) brightness(1.15)', aura: '#ffd54a' },
    stats: { growth: 65, sweetness: 90, size: 50, resistance: 45 }, colorGene: 'KIM',
    days: 2, cropPrice: 90, gene: 'solar',
    description: 'Quả mọng toả ra hơi ấm của mặt trời. Vị như mùa hè.',
    hint: 'Một quả mọng được mặt trời chạm vào.',
  }),
  cherrytomato: P({
    id: 'cherrytomato', dex: 10, name: 'Cà Chua Bi', rarity: 'uncommon', family: 'fruit', icon: '🍒',
    stats: { growth: 70, sweetness: 70, size: 25, resistance: 40 }, colorGene: 'ĐỎ',
    days: 2, cropPrice: 75,
    description: 'Nhỏ xinh, mọc thành cặp và ngọt khó tin.',
    hint: 'Hai loại quả đỏ, một quả ngọt hơn quả kia.',
  }),
  popcorn: P({
    id: 'popcorn', dex: 11, name: 'Ngô Bỏng', rarity: 'uncommon', family: 'grain', icon: '🍿',
    stats: { growth: 55, sweetness: 35, size: 55, resistance: 55 }, colorGene: 'TRẮNG',
    days: 3, cropPrice: 85,
    description: 'Hạt tự nổ bung dưới nắng gắt.',
    hint: 'Ngũ cốc mê nắng hơi quá đà.',
  }),
  chili: P({
    id: 'chili', dex: 12, name: 'Ớt Salsa', rarity: 'uncommon', family: 'fruit', icon: '🌶️',
    stats: { growth: 60, sweetness: 5, size: 30, resistance: 65 }, colorGene: 'ĐỎ',
    days: 2, cropPrice: 80, gene: 'fire',
    description: 'Cay đến mức đất cũng phải toát mồ hôi. Tách gene để lấy Gene Lửa.',
    hint: 'Quả đỏ gặp ngũ cốc vàng. Cay xè!',
  }),
  sweetpotato: P({
    id: 'sweetpotato', dex: 13, name: 'Khoai Lang', rarity: 'uncommon', family: 'root', icon: '🍠',
    stats: { growth: 50, sweetness: 75, size: 55, resistance: 70 }, colorGene: 'CAM',
    days: 3, cropPrice: 70,
    description: 'Một loại củ mang trái tim của ngũ cốc.',
    hint: 'Củ mơ ước được làm ngũ cốc.',
  }),
  bellpepper: P({
    id: 'bellpepper', dex: 14, name: 'Ớt Chuông', rarity: 'uncommon', family: 'fruit', icon: '🫑',
    stats: { growth: 60, sweetness: 35, size: 50, resistance: 60 }, colorGene: 'XANH LÁ',
    days: 2, cropPrice: 70,
    description: 'Giòn, xanh mướt và cứng cáp bất ngờ.',
    hint: 'Quả đỏ + củ cam = thứ gì đó màu xanh?',
  }),
  watermelon: P({
    id: 'watermelon', dex: 15, name: 'Dưa Hấu', rarity: 'uncommon', family: 'vine', icon: '🍉',
    stats: { growth: 40, sweetness: 85, size: 95, resistance: 50 }, colorGene: 'XANH LÁ',
    days: 3, cropPrice: 190,
    description: 'Quả dây leo khổng lồ với ruột ngọt như dâu.',
    hint: 'Dây leo to lớn mang trái tim quả mọng.',
  }),
  blueberry: P({
    id: 'blueberry', dex: 16, name: 'Việt Quất', rarity: 'uncommon', family: 'berry', icon: '🫐',
    stats: { growth: 65, sweetness: 80, size: 20, resistance: 50 }, colorGene: 'XANH LAM',
    days: 2, cropPrice: 150, gene: 'moon',
    description: 'Quả mọng tí hon ẩn chứa gene mặt trăng mờ nhạt.',
    hint: 'Hai quả mọng, một tím, một đỏ.',
  }),

  /* ---------- Rare mutations ---------- */
  moonberry: P({
    id: 'moonberry', dex: 17, name: 'Dâu Ánh Trăng', rarity: 'rare', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(250deg) saturate(1.3)', aura: '#b18cff', badge: '🌙' },
    stats: { growth: 60, sweetness: 95, size: 50, resistance: 40 }, colorGene: 'TÍM',
    days: 2, cropPrice: 260, gene: 'moon',
    description: 'Phát sáng dịu nhẹ trong bóng tối. Chỉ nở khi có ảnh hưởng của mặt trăng.',
    hint: 'Một quả mọng được mặt trăng hôn lên.',
  }),
  frostberry: P({
    id: 'frostberry', dex: 18, name: 'Dâu Băng Giá', rarity: 'rare', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(165deg) saturate(.8) brightness(1.35)', aura: '#a8ecff', badge: '❄️' },
    stats: { growth: 55, sweetness: 80, size: 40, resistance: 85 }, colorGene: 'XANH BĂNG',
    days: 2, cropPrice: 240, gene: 'frost',
    description: 'Giòn như kem đá. Hạt của nó mọc cả tinh thể băng.',
    hint: 'Một quả mọng bị đóng băng và thích điều đó.',
  }),
  frostroot: P({
    id: 'frostroot', dex: 19, name: 'Củ Băng', rarity: 'rare', family: 'root', icon: '🥕',
    look: { filter: 'hue-rotate(165deg) brightness(1.2)', aura: '#8fe3ff', badge: '❄️' },
    stats: { growth: 50, sweetness: 60, size: 40, resistance: 90 }, colorGene: 'XANH BĂNG',
    days: 2, cropPrice: 220, gene: 'frost',
    description: 'Một loại củ lúc nào sờ vào cũng lạnh buốt.',
    hint: 'Một loại củ đến từ vùng lãnh nguyên.',
  }),
  embercorn: P({
    id: 'embercorn', dex: 20, name: 'Ngô Than Hồng', rarity: 'rare', family: 'grain', icon: '🌽',
    look: { filter: 'hue-rotate(-35deg) saturate(2.2)', aura: '#ff7a3d', badge: '🔥' },
    stats: { growth: 55, sweetness: 45, size: 60, resistance: 75 }, colorGene: 'ĐỎ',
    days: 3, cropPrice: 250, gene: 'fire',
    description: 'Hạt ngô âm ỉ như than hồng. Ấm suốt cả mùa đông.',
    hint: 'Ngũ cốc được tôi luyện trong nhiệt.',
  }),
  nightcorn: P({
    id: 'nightcorn', dex: 21, name: 'Ngô Bóng Đêm', rarity: 'rare', family: 'grain', icon: '🌽',
    look: { filter: 'hue-rotate(205deg) brightness(.8) saturate(1.6)', aura: '#6c63ff', badge: '🌙' },
    stats: { growth: 55, sweetness: 55, size: 60, resistance: 60 }, colorGene: 'CHÀM',
    days: 3, cropPrice: 260, gene: 'moon',
    description: 'Hạt màu chàm lấp lánh như bầu trời đêm.',
    hint: 'Ngũ cốc chỉ chín dưới ánh trăng.',
  }),
  glowshroom: P({
    id: 'glowshroom', dex: 22, name: 'Nấm Phát Sáng', rarity: 'rare', family: 'fungus', icon: '🍄',
    look: { filter: 'hue-rotate(150deg) saturate(1.6) brightness(1.2)', aura: '#4dffd2', badge: '✨' },
    stats: { growth: 70, sweetness: 25, size: 35, resistance: 60 }, colorGene: 'NGỌC',
    days: 2, cropPrice: 290, gene: 'moon',
    description: 'Thắp sáng cả nông trại vào ban đêm như một chiếc đèn lồng.',
    hint: 'Một cây nấm đã uống ánh trăng.',
  }),
  voltomato: P({
    id: 'voltomato', dex: 23, name: 'Cà Chua Điện', rarity: 'rare', family: 'fruit', icon: '🍅',
    look: { filter: 'hue-rotate(55deg) saturate(1.8) brightness(1.15)', aura: '#ffe94d', badge: '⚡' },
    stats: { growth: 70, sweetness: 30, size: 55, resistance: 60 }, colorGene: 'VÀNG',
    days: 2, cropPrice: 300, gene: 'thunder',
    description: 'Kêu rè rè khe khẽ. Đừng liếm thử.',
    hint: 'Một quả bị sét đánh trúng.',
  }),

  /* ---------- Epic mutations ---------- */
  thunderberry: P({
    id: 'thunderberry', dex: 24, name: 'Dâu Sấm Sét', rarity: 'epic', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(195deg) saturate(1.8)', aura: '#3fb8ff', badge: '⚡' },
    stats: { growth: 40, sweetness: 80, size: 60, resistance: 80 }, colorGene: 'XANH LAM',
    days: 2, cropPrice: 520, gene: 'thunder',
    description: 'Tích đầy điện. Cắn vào nghe tách tách như tĩnh điện.',
    hint: 'Một quả mọng lách tách năng lượng.',
  }),
  magmaberry: P({
    id: 'magmaberry', dex: 25, name: 'Dâu Dung Nham', rarity: 'epic', family: 'berry', icon: '🍓',
    look: { filter: 'saturate(2.5) contrast(1.3) brightness(.85)', aura: '#ff3d00', badge: '🌋' },
    stats: { growth: 45, sweetness: 70, size: 55, resistance: 90 }, colorGene: 'ĐỎ THẪM',
    days: 2, cropPrice: 560, gene: 'fire',
    description: 'Bên trong nóng chảy. Phải đeo găng khi thu hoạch.',
    hint: 'Một quả mọng mọc trên núi lửa.',
  }),
  goldensunflower: P({
    id: 'goldensunflower', dex: 26, name: 'Hướng Dương Vàng', rarity: 'epic', family: 'flower', icon: '🌻',
    look: { filter: 'sepia(.35) saturate(2.4) brightness(1.2)', aura: '#ffcc00', badge: '👑' },
    stats: { growth: 60, sweetness: 20, size: 95, resistance: 70 }, colorGene: 'KIM',
    days: 3, cropPrice: 620, gene: 'solar',
    description: 'Cánh hoa dát vàng ròng. Hoàng tộc của nông trại.',
    hint: 'Một bông hướng dương rực rỡ hơn cả mặt trời.',
  }),
  crystalcarrot: P({
    id: 'crystalcarrot', dex: 27, name: 'Cà Rốt Pha Lê', rarity: 'epic', family: 'root', icon: '🥕',
    look: { filter: 'hue-rotate(250deg) saturate(.7) brightness(1.45)', aura: '#d9b8ff', badge: '💎' },
    stats: { growth: 45, sweetness: 55, size: 35, resistance: 95 }, colorGene: 'LĂNG KÍNH',
    days: 3, cropPrice: 680, gene: 'crystal',
    description: 'Củ trong suốt, khúc xạ ánh sáng thành cầu vồng.',
    hint: 'Một loại củ mọc trong hốc đá quý.',
  }),
  stardustpumpkin: P({
    id: 'stardustpumpkin', dex: 28, name: 'Bí Ngô Bụi Sao', rarity: 'epic', family: 'vine', icon: '🎃',
    look: { filter: 'hue-rotate(230deg) saturate(1.4)', aura: '#8a7dff', badge: '⭐' },
    stats: { growth: 35, sweetness: 60, size: 100, resistance: 70 }, colorGene: 'VŨ TRỤ',
    days: 4, cropPrice: 920, gene: 'star',
    description: 'Vỏ chứa một thiên hà tí hon xoáy tròn khi lắc nhẹ.',
    hint: 'Một dây leo khổng lồ bắt được ngôi sao rơi.',
  }),

  /* ---------- Legendary ---------- */
  galaxygrape: P({
    id: 'galaxygrape', dex: 29, name: 'Nho Thiên Hà', rarity: 'legendary', family: 'berry', icon: '🍇',
    look: { filter: 'hue-rotate(60deg) saturate(1.8) brightness(1.1)', aura: '#ff6ad5', badge: '🌌' },
    stats: { growth: 55, sweetness: 99, size: 45, resistance: 80 }, colorGene: 'TINH VÂN',
    days: 3, cropPrice: 1600, gene: 'star',
    description: 'Mỗi quả nho là một tinh vân thu nhỏ. Vị của sự kỳ diệu.',
    hint: 'Quả mọng tím + một quả bí đầy sao.',
  }),
  prismabloom: P({
    id: 'prismabloom', dex: 30, name: 'Hoa Lăng Kính', rarity: 'legendary', family: 'flower', icon: '🌷',
    look: { aura: '#ff9de2', badge: '🌈', rainbow: true },
    stats: { growth: 80, sweetness: 80, size: 80, resistance: 80 }, colorGene: 'CẦU VỒNG',
    days: 3, cropPrice: 2600, gene: 'crystal',
    description: 'Loài hoa hiếm nhất từng tồn tại. Cánh hoa chuyển qua mọi sắc màu.',
    hint: 'Vàng + pha lê, hợp nhất nhờ gene pha lê.',
  }),
};

export const ALL_PLANTS = Object.values(PLANTS).sort((a, b) => a.dex - b.dex);
export const TOTAL_SPECIES = ALL_PLANTS.length;
export const STARTER_SPECIES = ['strawberry', 'sunflower', 'corn', 'tomato', 'carrot'];

export const getAllPlants = () => ALL_PLANTS;
export const getPlantById = (id: string) => PLANTS[id];
