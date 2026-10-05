export type ElementType =
  | 'nature'
  | 'fire'
  | 'water'
  | 'electric'
  | 'ice'
  | 'lunar'
  | 'solar'
  | 'eclipse'
  | 'cosmic';

export type GeneGrade = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export const GRADE_MULTIPLIERS: Record<GeneGrade, number> = {
  D: 0.85,
  C: 0.95,
  B: 1.05,
  A: 1.18,
  S: 1.35,
  SS: 1.55,
};

export const GRADE_COLORS: Record<GeneGrade, string> = {
  D: '#a0a0a0',
  C: '#52b788',
  B: '#4aa8ff',
  A: '#9b6bff',
  S: '#ffc53d',
  SS: '#ff5d73',
};

export const ELEMENT_INFO: Record<ElementType, { name: string; icon: string; color: string; strongAgainst: ElementType[] }> = {
  nature: { name: 'Tự Nhiên', icon: '🌱', color: '#62c14e', strongAgainst: ['water'] },
  fire: { name: 'Lửa', icon: '🔥', color: '#ff5d73', strongAgainst: ['nature', 'ice'] },
  water: { name: 'Nước', icon: '💧', color: '#4aa8ff', strongAgainst: ['fire'] },
  electric: { name: 'Điện', icon: '⚡', color: '#ffc53d', strongAgainst: ['water'] },
  ice: { name: 'Băng', icon: '❄️', color: '#74c0fc', strongAgainst: ['nature'] },
  lunar: { name: 'Mặt Trăng', icon: '🌙', color: '#9b6bff', strongAgainst: ['solar'] },
  solar: { name: 'Mặt Trời', icon: '☀️', color: '#ffa94d', strongAgainst: ['lunar'] },
  eclipse: { name: 'Nhật Thực', icon: '🌘', color: '#e599f7', strongAgainst: ['solar', 'lunar'] },
  cosmic: { name: 'Vũ Trụ', icon: '🌌', color: '#63e6be', strongAgainst: ['nature', 'fire', 'water', 'electric', 'ice'] },
};

export interface CreatureStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  mana: number;
  maxMana: number;
  mag: number;
  spd: number;
}

export interface CreatureGeneGrades {
  hp: GeneGrade;
  atk: GeneGrade;
  def: GeneGrade;
  mana: GeneGrade;
  mag: GeneGrade;
  spd: GeneGrade;
}

export interface CreatureSpecies {
  id: string;
  dex: number;
  name: string;
  title: string;
  icon: string;
  element: ElementType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseStats: { hp: number; atk: number; def: number; mana: number; mag: number; spd: number };
  defaultSkills: string[];
  defaultTrait: string;
  description: string;
  hatchDays: number;
}

export interface CreatureInstance {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  element: ElementType;
  generation: number;
  parentA: string | null;
  parentB: string | null;
  geneGrades: CreatureGeneGrades;
  stats: CreatureStats;
  skills: string[];
  trait: string;
  bond: number; // 0 - 100
  hunger: number; // 0 - 100
  isShiny?: boolean;
  mutation?: string | null;
}

export interface EggInstance {
  id: string;
  speciesId: string;
  generation: number;
  daysRemaining: number;
  parentA: string | null;
  parentB: string | null;
  inheritedGrades: CreatureGeneGrades;
}

export const ALL_CREATURES: CreatureSpecies[] = [
  {
    id: 'firefox',
    dex: 1,
    name: 'EmberFox',
    title: 'Cáo Lửa',
    icon: '🦊🔥',
    element: 'fire',
    rarity: 'common',
    baseStats: { hp: 120, atk: 24, def: 15, mana: 50, mag: 22, spd: 20 },
    defaultSkills: ['tackle', 'fire_claw', 'fireball'],
    defaultTrait: 'hot_blood',
    description: 'Chú cáo nhỏ mang ngọn lửa rực cháy trên đuôi, có tính cách hiếu chiến.',
    hatchDays: 1,
  },
  {
    id: 'aquaslime',
    dex: 2,
    name: 'AquaSlime',
    title: 'Quái Nhớt Nước',
    icon: '💧🦠',
    element: 'water',
    rarity: 'common',
    baseStats: { hp: 150, atk: 18, def: 20, mana: 60, mag: 20, spd: 14 },
    defaultSkills: ['tackle', 'water_splash', 'heal_sprout'],
    defaultTrait: 'liquid_body',
    description: 'Sinh vật nhớt nước mềm mại, có khả năng tự chữa lành vết thương.',
    hatchDays: 1,
  },
  {
    id: 'mossling',
    dex: 3,
    name: 'Mossling',
    title: 'Mầm Rêu',
    icon: '🌱🐾',
    element: 'nature',
    rarity: 'common',
    baseStats: { hp: 140, atk: 20, def: 22, mana: 40, mag: 18, spd: 16 },
    defaultSkills: ['tackle', 'leaf_blade', 'heal_sprout'],
    defaultTrait: 'photosynthesis',
    description: 'Thú rêu nhỏ sống chan hoà với thiên nhiên, ưa thích thời tiết nắng đẹp.',
    hatchDays: 1,
  },
  {
    id: 'voltbird',
    dex: 4,
    name: 'VoltBird',
    title: 'Chim Sấm',
    icon: '⚡🐦',
    element: 'electric',
    rarity: 'uncommon',
    baseStats: { hp: 110, atk: 26, def: 14, mana: 55, mag: 25, spd: 28 },
    defaultSkills: ['tackle', 'peck', 'thunder_bolt'],
    defaultTrait: 'overcharge',
    description: 'Chú chim phóng điện cực nhanh, tấn công áp đảo đối thủ từ lượt đầu.',
    hatchDays: 1,
  },
  {
    id: 'lunacat',
    dex: 5,
    name: 'LunaCat',
    title: 'Mèo Trăng',
    icon: '🌙🐱',
    element: 'lunar',
    rarity: 'uncommon',
    baseStats: { hp: 125, atk: 22, def: 16, mana: 75, mag: 28, spd: 24 },
    defaultSkills: ['tackle', 'claw', 'lunar_beam'],
    defaultTrait: 'moon_child',
    description: 'Mèo trăng huyền bí hấp thụ năng lượng mặt trăng để phục hồi năng lượng.',
    hatchDays: 2,
  },
  {
    id: 'frostwolf',
    dex: 6,
    name: 'FrostWolf',
    title: 'Sói Băng',
    icon: '❄️🐺',
    element: 'ice',
    rarity: 'uncommon',
    baseStats: { hp: 135, atk: 28, def: 24, mana: 50, mag: 20, spd: 22 },
    defaultSkills: ['tackle', 'bite', 'frost_bite'],
    defaultTrait: 'thick_fur',
    description: 'Chú sói tuyết kiên cường với lớp lông băng bảo vệ chắc chắn.',
    hatchDays: 2,
  },
  {
    id: 'eclipsefox',
    dex: 7,
    name: 'EclipseFox',
    title: 'Cáo Nhật Thực',
    icon: '🌘🦊',
    element: 'eclipse',
    rarity: 'epic',
    baseStats: { hp: 180, atk: 38, def: 28, mana: 90, mag: 42, spd: 32 },
    defaultSkills: ['tackle', 'fire_claw', 'lunar_beam', 'eclipse_blast'],
    defaultTrait: 'burning_blood',
    description: 'Giống cáo quý hiếm sinh ra từ sự giao thoa giữa Lửa và Trăng. Mang sức mạnh tàn phá.',
    hatchDays: 2,
  },
  {
    id: 'glacierslime',
    dex: 8,
    name: 'GlacierSlime',
    title: 'Quái Băng Giá',
    icon: '🧊🦠',
    element: 'ice',
    rarity: 'rare',
    baseStats: { hp: 200, atk: 24, def: 36, mana: 70, mag: 30, spd: 15 },
    defaultSkills: ['tackle', 'water_splash', 'frost_bite'],
    defaultTrait: 'thick_fur',
    description: 'Quái nhớt đóng băng cứng như đá, lá chắn phòng thủ vững chắc.',
    hatchDays: 2,
  },
  {
    id: 'volcanik',
    dex: 9,
    name: 'Volcanik',
    title: 'Chim Lửa Điện',
    icon: '🌋🦅',
    element: 'fire',
    rarity: 'rare',
    baseStats: { hp: 140, atk: 35, def: 20, mana: 65, mag: 36, spd: 34 },
    defaultSkills: ['fire_claw', 'thunder_bolt', 'inferno'],
    defaultTrait: 'overcharge',
    description: 'Chim lửa điện có tốc độ bay như chớp và kỹ năng thiêu đốt áp đảo.',
    hatchDays: 2,
  },
  {
    id: 'solardragon',
    dex: 10,
    name: 'SolarDragon',
    title: 'Rồng Mặt Trời',
    icon: '☀️🐉',
    element: 'solar',
    rarity: 'epic',
    baseStats: { hp: 210, atk: 42, def: 32, mana: 85, mag: 45, spd: 26 },
    defaultSkills: ['tackle', 'leaf_blade', 'solar_flare'],
    defaultTrait: 'photosynthesis',
    description: 'Rồng cổ xưa rực sáng như ánh mặt trời, sức mạnh phép thuật đỉnh cao.',
    hatchDays: 3,
  },
  {
    id: 'cosmicbeast',
    dex: 11,
    name: 'CosmicBeast',
    title: 'Thú Vũ Trụ',
    icon: '🌌🦁',
    element: 'cosmic',
    rarity: 'legendary',
    baseStats: { hp: 260, atk: 52, def: 40, mana: 120, mag: 55, spd: 38 },
    defaultSkills: ['tackle', 'eclipse_blast', 'inferno', 'solar_flare'],
    defaultTrait: 'overcharge',
    description: 'Thú huyền thoại mang năng lượng vũ trụ bao la. Có thể khắc chế mọi hệ.',
    hatchDays: 3,
  },
  {
    id: 'crystalgolem',
    dex: 12,
    name: 'CrystalGolem',
    title: 'Golem Pha Lê',
    icon: '💎🗿',
    element: 'nature',
    rarity: 'legendary',
    baseStats: { hp: 290, atk: 40, def: 55, mana: 80, mag: 30, spd: 12 },
    defaultSkills: ['tackle', 'leaf_blade', 'frost_bite'],
    defaultTrait: 'thick_fur',
    description: 'Golem hình thành từ tinh thể pha lê nghìn năm, lượng máu và giáp siêu khủng.',
    hatchDays: 3,
  },
];

export const STARTER_CREATURE_SPECIES = ['firefox', 'mossling'];

export const CREATURES: Record<string, CreatureSpecies> = ALL_CREATURES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {}
);
