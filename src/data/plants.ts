import type { GeneId, Rarity } from './genes';

export type { Rarity } from './genes';

export type Family = 'berry' | 'flower' | 'grain' | 'fruit' | 'root' | 'vine' | 'fungus';

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
    id: 'strawberry', dex: 1, name: 'Strawberry', rarity: 'common', family: 'berry', icon: '🍓',
    stats: { growth: 70, sweetness: 85, size: 40, resistance: 30 }, colorGene: 'RED',
    days: 2, seedPrice: 10, cropPrice: 28,
    description: 'A sweet red berry. Its genes are famously unstable — perfect for experiments.',
    hint: 'Every farmer starts with this sweet red berry.',
  }),
  sunflower: P({
    id: 'sunflower', dex: 2, name: 'Sunflower', rarity: 'common', family: 'flower', icon: '🌻',
    stats: { growth: 60, sweetness: 10, size: 80, resistance: 50 }, colorGene: 'YELLOW',
    days: 3, seedPrice: 15, cropPrice: 45, gene: 'solar',
    description: 'Always facing the sun. Extracting it yields Solar Genes.',
    hint: 'A tall flower that follows the sun.',
  }),
  corn: P({
    id: 'corn', dex: 3, name: 'Corn', rarity: 'common', family: 'grain', icon: '🌽',
    stats: { growth: 50, sweetness: 40, size: 60, resistance: 60 }, colorGene: 'YELLOW',
    days: 3, seedPrice: 12, cropPrice: 38,
    description: 'A classic staple crop that reacts strongly to temperature.',
    hint: 'Golden kernels on a tall stalk.',
  }),
  tomato: P({
    id: 'tomato', dex: 4, name: 'Tomato', rarity: 'common', family: 'fruit', icon: '🍅',
    stats: { growth: 65, sweetness: 30, size: 50, resistance: 40 }, colorGene: 'RED',
    days: 2, seedPrice: 10, cropPrice: 30,
    description: 'A juicy red fruit, often mistaken for a vegetable.',
    hint: 'Fruit or vegetable? Nobody agrees.',
  }),
  carrot: P({
    id: 'carrot', dex: 5, name: 'Carrot', rarity: 'common', family: 'root', icon: '🥕',
    stats: { growth: 55, sweetness: 50, size: 30, resistance: 70 }, colorGene: 'ORANGE',
    days: 2, seedPrice: 8, cropPrice: 24,
    description: 'A crunchy orange root. Hardy enough to survive any soil.',
    hint: 'A crunchy orange root.',
  }),
  pumpkin: P({
    id: 'pumpkin', dex: 6, name: 'Pumpkin', rarity: 'common', family: 'vine', icon: '🎃',
    stats: { growth: 35, sweetness: 45, size: 95, resistance: 65 }, colorGene: 'ORANGE',
    days: 4, seedPrice: 30, unlockAt: 7, cropPrice: 100,
    description: 'Slow to grow, but huge and valuable.',
    hint: 'Unlocks in the shop after 7 discoveries.',
  }),
  grape: P({
    id: 'grape', dex: 7, name: 'Grape', rarity: 'common', family: 'berry', icon: '🍇',
    stats: { growth: 60, sweetness: 80, size: 30, resistance: 40 }, colorGene: 'PURPLE',
    days: 3, seedPrice: 25, unlockAt: 11, cropPrice: 75,
    description: 'Clusters of purple berries with deep, complex genes.',
    hint: 'Unlocks in the shop after 11 discoveries.',
  }),
  mushroom: P({
    id: 'mushroom', dex: 8, name: 'Mushroom', rarity: 'common', family: 'fungus', icon: '🍄',
    stats: { growth: 75, sweetness: 20, size: 30, resistance: 55 }, colorGene: 'RED',
    days: 2, seedPrice: 20, unlockAt: 15, cropPrice: 60,
    description: 'Thrives in the dark. Very sensitive to moonlight.',
    hint: 'Unlocks in the shop after 15 discoveries.',
  }),

  /* ---------- Simple hybrids ---------- */
  sunberry: P({
    id: 'sunberry', dex: 9, name: 'Sunberry', rarity: 'uncommon', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(38deg) saturate(1.6) brightness(1.15)', aura: '#ffd54a' },
    stats: { growth: 65, sweetness: 90, size: 50, resistance: 45 }, colorGene: 'GOLD',
    days: 2, cropPrice: 90, gene: 'solar',
    description: 'A berry radiating solar warmth. Tastes like summer.',
    hint: 'A berry touched by the sun.',
  }),
  cherrytomato: P({
    id: 'cherrytomato', dex: 10, name: 'Cherry Tomato', rarity: 'uncommon', family: 'fruit', icon: '🍒',
    stats: { growth: 70, sweetness: 70, size: 25, resistance: 40 }, colorGene: 'RED',
    days: 2, cropPrice: 75,
    description: 'Bite-sized, twin-stemmed and impossibly sweet.',
    hint: 'Two red fruits, one sweeter than the other.',
  }),
  popcorn: P({
    id: 'popcorn', dex: 11, name: 'Popcorn Stalk', rarity: 'uncommon', family: 'grain', icon: '🍿',
    stats: { growth: 55, sweetness: 35, size: 55, resistance: 55 }, colorGene: 'WHITE',
    days: 3, cropPrice: 85,
    description: 'The kernels pop by themselves under bright sunlight.',
    hint: 'Grain that loves the sun a little too much.',
  }),
  chili: P({
    id: 'chili', dex: 12, name: 'Salsa Pepper', rarity: 'uncommon', family: 'fruit', icon: '🌶️',
    stats: { growth: 60, sweetness: 5, size: 30, resistance: 65 }, colorGene: 'RED',
    days: 2, cropPrice: 80, gene: 'fire',
    description: 'Spicy enough to make the soil sweat. Extract it for Fire Genes.',
    hint: 'Red fruit meets golden grain. Spicy!',
  }),
  sweetpotato: P({
    id: 'sweetpotato', dex: 13, name: 'Sweet Potato', rarity: 'uncommon', family: 'root', icon: '🍠',
    stats: { growth: 50, sweetness: 75, size: 55, resistance: 70 }, colorGene: 'ORANGE',
    days: 3, cropPrice: 70,
    description: 'A root with a grain-like heart.',
    hint: 'A root that dreamed of being grain.',
  }),
  bellpepper: P({
    id: 'bellpepper', dex: 14, name: 'Bell Pepper', rarity: 'uncommon', family: 'fruit', icon: '🫑',
    stats: { growth: 60, sweetness: 35, size: 50, resistance: 60 }, colorGene: 'GREEN',
    days: 2, cropPrice: 70,
    description: 'Crisp, green and surprisingly hardy.',
    hint: 'Red fruit + orange root = something green?',
  }),
  watermelon: P({
    id: 'watermelon', dex: 15, name: 'Watermelon', rarity: 'uncommon', family: 'vine', icon: '🍉',
    stats: { growth: 40, sweetness: 85, size: 95, resistance: 50 }, colorGene: 'GREEN',
    days: 3, cropPrice: 190,
    description: 'A giant vine fruit with a berry-sweet core.',
    hint: 'A big vine with a berry heart.',
  }),
  blueberry: P({
    id: 'blueberry', dex: 16, name: 'Blueberry', rarity: 'uncommon', family: 'berry', icon: '🫐',
    stats: { growth: 65, sweetness: 80, size: 20, resistance: 50 }, colorGene: 'BLUE',
    days: 2, cropPrice: 150, gene: 'moon',
    description: 'Tiny berries holding a faint lunar gene.',
    hint: 'Two berries, one purple, one red.',
  }),

  /* ---------- Rare mutations ---------- */
  moonberry: P({
    id: 'moonberry', dex: 17, name: 'Moonberry', rarity: 'rare', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(250deg) saturate(1.3)', aura: '#b18cff', badge: '🌙' },
    stats: { growth: 60, sweetness: 95, size: 50, resistance: 40 }, colorGene: 'PURPLE',
    days: 2, cropPrice: 260, gene: 'moon',
    description: 'Glows softly in the dark. Only blooms with lunar influence.',
    hint: 'A berry kissed by the moon.',
  }),
  frostberry: P({
    id: 'frostberry', dex: 18, name: 'Frostberry', rarity: 'rare', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(165deg) saturate(.8) brightness(1.35)', aura: '#a8ecff', badge: '❄️' },
    stats: { growth: 55, sweetness: 80, size: 40, resistance: 85 }, colorGene: 'CYAN',
    days: 2, cropPrice: 240, gene: 'frost',
    description: 'Crunchy like sorbet. Grows ice crystals on its seeds.',
    hint: 'A berry that froze and liked it.',
  }),
  frostroot: P({
    id: 'frostroot', dex: 19, name: 'Frostroot', rarity: 'rare', family: 'root', icon: '🥕',
    look: { filter: 'hue-rotate(165deg) brightness(1.2)', aura: '#8fe3ff', badge: '❄️' },
    stats: { growth: 50, sweetness: 60, size: 40, resistance: 90 }, colorGene: 'CYAN',
    days: 2, cropPrice: 220, gene: 'frost',
    description: 'A root that is always cold to the touch.',
    hint: 'A root from the tundra.',
  }),
  embercorn: P({
    id: 'embercorn', dex: 20, name: 'Embercorn', rarity: 'rare', family: 'grain', icon: '🌽',
    look: { filter: 'hue-rotate(-35deg) saturate(2.2)', aura: '#ff7a3d', badge: '🔥' },
    stats: { growth: 55, sweetness: 45, size: 60, resistance: 75 }, colorGene: 'RED',
    days: 3, cropPrice: 250, gene: 'fire',
    description: 'Kernels smoulder like coals. Warm all winter.',
    hint: 'Grain forged in heat.',
  }),
  nightcorn: P({
    id: 'nightcorn', dex: 21, name: 'Night Corn', rarity: 'rare', family: 'grain', icon: '🌽',
    look: { filter: 'hue-rotate(205deg) brightness(.8) saturate(1.6)', aura: '#6c63ff', badge: '🌙' },
    stats: { growth: 55, sweetness: 55, size: 60, resistance: 60 }, colorGene: 'INDIGO',
    days: 3, cropPrice: 260, gene: 'moon',
    description: 'Indigo kernels that sparkle like a night sky.',
    hint: 'Grain that only ripens under moonlight.',
  }),
  glowshroom: P({
    id: 'glowshroom', dex: 22, name: 'Glowshroom', rarity: 'rare', family: 'fungus', icon: '🍄',
    look: { filter: 'hue-rotate(150deg) saturate(1.6) brightness(1.2)', aura: '#4dffd2', badge: '✨' },
    stats: { growth: 70, sweetness: 25, size: 35, resistance: 60 }, colorGene: 'TEAL',
    days: 2, cropPrice: 290, gene: 'moon',
    description: 'Lights up the farm at night like a lantern.',
    hint: 'A fungus that drank moonlight.',
  }),
  voltomato: P({
    id: 'voltomato', dex: 23, name: 'Voltomato', rarity: 'rare', family: 'fruit', icon: '🍅',
    look: { filter: 'hue-rotate(55deg) saturate(1.8) brightness(1.15)', aura: '#ffe94d', badge: '⚡' },
    stats: { growth: 70, sweetness: 30, size: 55, resistance: 60 }, colorGene: 'YELLOW',
    days: 2, cropPrice: 300, gene: 'thunder',
    description: 'Buzzes faintly. Do not lick.',
    hint: 'A fruit struck by lightning.',
  }),

  /* ---------- Epic mutations ---------- */
  thunderberry: P({
    id: 'thunderberry', dex: 24, name: 'Thunderberry', rarity: 'epic', family: 'berry', icon: '🍓',
    look: { filter: 'hue-rotate(195deg) saturate(1.8)', aura: '#3fb8ff', badge: '⚡' },
    stats: { growth: 40, sweetness: 80, size: 60, resistance: 80 }, colorGene: 'BLUE',
    days: 2, cropPrice: 520, gene: 'thunder',
    description: 'Charged with electricity. Pops like static when bitten.',
    hint: 'A berry crackling with energy.',
  }),
  magmaberry: P({
    id: 'magmaberry', dex: 25, name: 'Magmaberry', rarity: 'epic', family: 'berry', icon: '🍓',
    look: { filter: 'saturate(2.5) contrast(1.3) brightness(.85)', aura: '#ff3d00', badge: '🌋' },
    stats: { growth: 45, sweetness: 70, size: 55, resistance: 90 }, colorGene: 'CRIMSON',
    days: 2, cropPrice: 560, gene: 'fire',
    description: 'Molten on the inside. Must be harvested with gloves.',
    hint: 'A berry grown on a volcano.',
  }),
  goldensunflower: P({
    id: 'goldensunflower', dex: 26, name: 'Golden Sunflower', rarity: 'epic', family: 'flower', icon: '🌻',
    look: { filter: 'sepia(.35) saturate(2.4) brightness(1.2)', aura: '#ffcc00', badge: '👑' },
    stats: { growth: 60, sweetness: 20, size: 95, resistance: 70 }, colorGene: 'GOLD',
    days: 3, cropPrice: 620, gene: 'solar',
    description: 'Petals of pure gold leaf. Royalty of the farm.',
    hint: 'A sunflower that outshines the sun.',
  }),
  crystalcarrot: P({
    id: 'crystalcarrot', dex: 27, name: 'Crystal Carrot', rarity: 'epic', family: 'root', icon: '🥕',
    look: { filter: 'hue-rotate(250deg) saturate(.7) brightness(1.45)', aura: '#d9b8ff', badge: '💎' },
    stats: { growth: 45, sweetness: 55, size: 35, resistance: 95 }, colorGene: 'PRISM',
    days: 3, cropPrice: 680, gene: 'crystal',
    description: 'A translucent root that refracts light into rainbows.',
    hint: 'A root grown in a geode.',
  }),
  stardustpumpkin: P({
    id: 'stardustpumpkin', dex: 28, name: 'Stardust Pumpkin', rarity: 'epic', family: 'vine', icon: '🎃',
    look: { filter: 'hue-rotate(230deg) saturate(1.4)', aura: '#8a7dff', badge: '⭐' },
    stats: { growth: 35, sweetness: 60, size: 100, resistance: 70 }, colorGene: 'COSMIC',
    days: 4, cropPrice: 920, gene: 'star',
    description: 'Its shell holds a tiny galaxy that swirls when shaken.',
    hint: 'A giant vine that caught a falling star.',
  }),

  /* ---------- Legendary ---------- */
  galaxygrape: P({
    id: 'galaxygrape', dex: 29, name: 'Galaxy Grape', rarity: 'legendary', family: 'berry', icon: '🍇',
    look: { filter: 'hue-rotate(60deg) saturate(1.8) brightness(1.1)', aura: '#ff6ad5', badge: '🌌' },
    stats: { growth: 55, sweetness: 99, size: 45, resistance: 80 }, colorGene: 'NEBULA',
    days: 3, cropPrice: 1600, gene: 'star',
    description: 'Each grape is a miniature nebula. Tastes like wonder.',
    hint: 'Purple berries + a pumpkin full of stars.',
  }),
  prismabloom: P({
    id: 'prismabloom', dex: 30, name: 'Prismabloom', rarity: 'legendary', family: 'flower', icon: '🌷',
    look: { aura: '#ff9de2', badge: '🌈', rainbow: true },
    stats: { growth: 80, sweetness: 80, size: 80, resistance: 80 }, colorGene: 'RAINBOW',
    days: 3, cropPrice: 2600, gene: 'crystal',
    description: 'The rarest bloom in existence. Its petals shift through every colour.',
    hint: 'Gold + crystal, fused by a crystal gene.',
  }),
};

export const ALL_PLANTS = Object.values(PLANTS).sort((a, b) => a.dex - b.dex);
export const TOTAL_SPECIES = ALL_PLANTS.length;
export const STARTER_SPECIES = ['strawberry', 'sunflower', 'corn', 'tomato', 'carrot'];

export const getAllPlants = () => ALL_PLANTS;
export const getPlantById = (id: string) => PLANTS[id];
