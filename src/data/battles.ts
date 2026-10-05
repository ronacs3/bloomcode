import { ALL_CREATURES, type CreatureInstance } from './creatures';

export type BattleMode = 'wild' | 'trainer' | 'arena' | 'boss';

export interface BattleStage {
  id: string;
  name: string;
  mode: BattleMode;
  icon: string;
  description: string;
  minLevel: number;
  enemies: Array<{
    speciesId: string;
    name: string;
    level: number;
    shiny?: boolean;
  }>;
  rewardCoins: number;
  rewardGp: number;
  rewardEggSpecies?: string;
}

export const BATTLE_STAGES: BattleStage[] = [
  {
    id: 'wild_forest',
    name: 'Khu Rừng Hoang Dã',
    mode: 'wild',
    icon: '🌲',
    description: 'Nơi sinh sống của các quái thú rêu và thủy quái hiền lành.',
    minLevel: 1,
    enemies: [
      { speciesId: 'mossling', name: 'Mossling Hoang Dã', level: 2 },
      { speciesId: 'aquaslime', name: 'AquaSlime Hoang Dã', level: 3 },
    ],
    rewardCoins: 50,
    rewardGp: 5,
  },
  {
    id: 'wild_volcano',
    name: 'Núi Lửa Cuồng Phong',
    mode: 'wild',
    icon: '🌋',
    description: 'Vùng đất của cáo lửa và chim điện hung hãn.',
    minLevel: 5,
    enemies: [
      { speciesId: 'firefox', name: 'EmberFox Cuồng Nhiệt', level: 6 },
      { speciesId: 'voltbird', name: 'VoltBird Tia Sấm', level: 7 },
      { speciesId: 'firefox', name: 'EmberFox Đầu Đàn', level: 8 },
    ],
    rewardCoins: 120,
    rewardGp: 12,
  },
  {
    id: 'trainer_ken',
    name: 'Thử Thách: Huấn Luyện Viên Ken',
    mode: 'trainer',
    icon: '🧑‍🌾',
    description: 'Ken là nhà nuôi thú trẻ tuổi với đội hình thấu hiểu hệ Nước & Băng.',
    minLevel: 8,
    enemies: [
      { speciesId: 'aquaslime', name: 'Slime Nước Của Ken', level: 9 },
      { speciesId: 'frostwolf', name: 'Sói Tuyết Của Ken', level: 10 },
      { speciesId: 'glacierslime', name: 'Khối Băng Của Ken', level: 11 },
    ],
    rewardCoins: 250,
    rewardGp: 20,
    rewardEggSpecies: 'frostwolf',
  },
  {
    id: 'arena_bronze',
    name: 'Đấu Trường: Hạng Đồng',
    mode: 'arena',
    icon: '🥉',
    description: 'Vòng đấu giải hạng Đồng thử thách khả năng phối hợp chiến thuật.',
    minLevel: 10,
    enemies: [
      { speciesId: 'lunacat', name: 'Mèo Trăng Bóng Đêm', level: 12 },
      { speciesId: 'voltbird', name: 'Chim Sấm Cuồng Điện', level: 13 },
      { speciesId: 'firefox', name: 'Cáo Lửa Rực Cháy', level: 14 },
    ],
    rewardCoins: 400,
    rewardGp: 35,
    rewardEggSpecies: 'lunacat',
  },
  {
    id: 'arena_gold',
    name: 'Đấu Trường: Hạng Vàng',
    mode: 'arena',
    icon: '🥇',
    description: 'Trận bán kết đỉnh cao với những giống thú lai đột biến.',
    minLevel: 15,
    enemies: [
      { speciesId: 'eclipsefox', name: 'Cáo Nhật Thực Hủy Diệt', level: 16 },
      { speciesId: 'volcanik', name: 'Chim Lửa Điện Nổ Tung', level: 17 },
      { speciesId: 'solardragon', name: 'Rồng Mặt Trời Hoàng Gia', level: 18 },
    ],
    rewardCoins: 800,
    rewardGp: 60,
    rewardEggSpecies: 'eclipsefox',
  },
  {
    id: 'boss_drake',
    name: 'Trùm Cuối: Rồng Hỏa Diệm Cơ Thần',
    mode: 'boss',
    icon: '🐉🔥',
    description: 'Thách thức nguy hiểm nhất! Trùm rồng lửa bảo vệ trứng thần thoại.',
    minLevel: 20,
    enemies: [
      { speciesId: 'solardragon', name: 'Vệ Binh Mặt Trời', level: 20 },
      { speciesId: 'cosmicbeast', name: 'Rồng Thần Vũ Trụ', level: 22, shiny: true },
      { speciesId: 'crystalgolem', name: 'Golem Vệ Quốc', level: 21 },
    ],
    rewardCoins: 2000,
    rewardGp: 150,
    rewardEggSpecies: 'cosmicbeast',
  },
];

export function createEnemyInstance(speciesId: string, customName: string, level: number, shiny = false): CreatureInstance {
  const species = ALL_CREATURES.find((s) => s.id === speciesId) || ALL_CREATURES[0];
  const mul = 1 + (level - 1) * 0.15;

  const baseStats = species.baseStats;
  const hp = Math.round(baseStats.hp * mul);
  const mana = Math.round(baseStats.mana * mul);

  return {
    id: `enemy_${Math.random().toString(36).slice(2, 9)}`,
    speciesId: species.id,
    name: customName,
    level,
    xp: 0,
    maxXp: 100 * level,
    rarity: species.rarity,
    element: species.element,
    generation: 1,
    parentA: null,
    parentB: null,
    geneGrades: { hp: 'B', atk: 'B', def: 'B', mana: 'B', mag: 'B', spd: 'B' },
    stats: {
      hp,
      maxHp: hp,
      atk: Math.round(baseStats.atk * mul),
      def: Math.round(baseStats.def * mul),
      mana,
      maxMana: mana,
      mag: Math.round(baseStats.mag * mul),
      spd: Math.round(baseStats.spd * mul),
    },
    skills: [...species.defaultSkills],
    trait: species.defaultTrait,
    bond: 100,
    hunger: 100,
    isShiny: shiny,
  };
}
