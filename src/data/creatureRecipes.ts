import { type GeneGrade } from './creatures';

export interface BreedCombo {
  parentA: string;
  parentB: string;
  result: string;
  compatibility: number; // percentage
  mutationChance: number;
}

export const CREATURE_BREED_COMBOS: BreedCombo[] = [
  { parentA: 'firefox', parentB: 'lunacat', result: 'eclipsefox', compatibility: 85, mutationChance: 0.25 },
  { parentA: 'aquaslime', parentB: 'frostwolf', result: 'glacierslime', compatibility: 88, mutationChance: 0.20 },
  { parentA: 'firefox', parentB: 'voltbird', result: 'volcanik', compatibility: 82, mutationChance: 0.22 },
  { parentA: 'mossling', parentB: 'lunacat', result: 'solardragon', compatibility: 78, mutationChance: 0.18 },
  { parentA: 'eclipsefox', parentB: 'solardragon', result: 'cosmicbeast', compatibility: 70, mutationChance: 0.35 },
  { parentA: 'frostwolf', parentB: 'mossling', result: 'crystalgolem', compatibility: 75, mutationChance: 0.30 },
];

export const GRADE_ORDER: GeneGrade[] = ['D', 'C', 'B', 'A', 'S', 'SS'];

export function rollInheritedGrade(gradeA: GeneGrade, gradeB: GeneGrade, mutationBoost = 0): GeneGrade {
  const indexA = GRADE_ORDER.indexOf(gradeA);
  const indexB = GRADE_ORDER.indexOf(gradeB);
  const avg = Math.round((indexA + indexB) / 2);

  const roll = Math.random() + mutationBoost;
  let resultIndex = avg;

  if (roll > 0.85 && avg < GRADE_ORDER.length - 1) {
    resultIndex = Math.min(GRADE_ORDER.length - 1, avg + 1); // Upgrade!
  } else if (roll < 0.15 && avg > 0) {
    resultIndex = Math.max(0, avg - 1);
  }

  return GRADE_ORDER[resultIndex];
}

export interface CreatureFoodItem {
  id: string;
  name: string;
  icon: string;
  cropReq: Record<string, number>;
  statBoost: 'atk' | 'def' | 'mana' | 'spd' | 'hp' | 'mag';
  boostPercent: number;
  description: string;
}

export const CREATURE_FOODS: Record<string, CreatureFoodItem> = {
  power_berry: {
    id: 'power_berry',
    name: 'Quả Sức Mạnh',
    icon: '🍎',
    cropReq: { strawberry: 2, tomato: 2 },
    statBoost: 'atk',
    boostPercent: 10,
    description: 'Thức ăn đặc chế từ Dâu Tây & Cà Chua. Tăng +10% chỉ số Tấn công (ATK).',
  },
  moon_berry: {
    id: 'moon_berry',
    name: 'Dâu Mặt Trăng',
    icon: '🌙🍇',
    cropReq: { corn: 2, sunflower: 2 },
    statBoost: 'mana',
    boostPercent: 10,
    description: 'Thức ăn bồi bổ Mana từ Ngô & Hướng Dương. Tăng +10% Năng lượng (MANA).',
  },
  frost_root: {
    id: 'frost_root',
    name: 'Củ Băng Giá',
    icon: '❄️🥕',
    cropReq: { carrot: 3 },
    statBoost: 'def',
    boostPercent: 10,
    description: 'Củ Cà Rốt biến tính băng rải đất lạnh. Tăng +10% Phòng thủ (DEF).',
  },
  volt_fruit: {
    id: 'volt_fruit',
    name: 'Quả Sấm Sét',
    icon: '⚡🍋',
    cropReq: { tomato: 3, strawberry: 1 },
    statBoost: 'spd',
    boostPercent: 10,
    description: 'Món ăn kích thích thần kinh. Tăng +10% Tốc độ (SPD).',
  },
};

export function getBreedingRecipe(speciesA: string, speciesB: string): { childSpecies: string; chance: number } {
  const match = CREATURE_BREED_COMBOS.find(
    (c) =>
      (c.parentA === speciesA && c.parentB === speciesB) ||
      (c.parentA === speciesB && c.parentB === speciesA)
  );

  if (match) {
    return { childSpecies: match.result, chance: match.mutationChance };
  }

  return { childSpecies: speciesA, chance: 0.8 };
}
