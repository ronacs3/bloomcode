import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLANTS, STARTER_SPECIES, type PlantStats } from '@/data/plants';
import { GENES, RARITY_INFO, type GeneId } from '@/data/genes';
import {
  GRID_SIZE, START_PLOTS, SOILS, WEATHERS, SPRINKLER_PRICE, plotUnlockCost, rollWeather,
  type SoilId, type WeatherId,
} from '@/data/world';
import { EMPTY_STATS, QUESTS, type GameStats, type QuestContext } from '@/data/quests';
import { breedPlants, rollFarmMutation, statTotal, type BreedOutcome } from '@/lib/breeding';
import { playSfx, setMute, startAmbience, type Sfx } from '@/lib/sfx';
import { saveGameToIndexedDB } from '@/lib/db';
import { useUi } from './uiStore';

import {
  ALL_CREATURES, type CreatureInstance, type EggInstance, type GeneGrade, type CreatureGeneGrades,
} from '@/data/creatures';
import { CREATURE_BREED_COMBOS, CREATURE_FOODS, rollInheritedGrade } from '@/data/creatureRecipes';

export type View = 'farm' | 'ranch' | 'lab' | 'genedex' | 'battle' | 'shop' | 'inventory';
export type Tool = 'hoe' | 'water' | 'harvest' | 'seed' | 'soil';
export type LabUpgradeId = 'amp' | 'scanner' | 'twin';

export interface Plot {
  id: number;
  unlocked: boolean;
  tilled: boolean;
  soil: SoilId;
  plantId: string | null;
  growth: number;
  watered: boolean;
}

export const LAB_UPGRADES: Record<LabUpgradeId, { name: string; icon: string; costs: number[]; description: string[] }> = {
  amp: {
    name: 'Bộ Khuếch Đại Đột Biến', icon: '📡', costs: [20, 45, 90],
    description: ['+10% tỉ lệ đột biến khi lai', '+20% tỉ lệ đột biến khi lai', '+30% tỉ lệ đột biến khi lai'],
  },
  scanner: {
    name: 'Máy Quét Gene', icon: '🔍', costs: [25, 60],
    description: ['GeneDex hiện điều kiện đột biến', 'GeneDex hiện đầy đủ công thức'],
  },
  twin: {
    name: 'Lồng Ấp Song Sinh', icon: '🥚', costs: [40, 90],
    description: ['25% cơ hội nhận thêm hạt khi lai', '50% cơ hội nhận thêm hạt khi lai'],
  },
};

type Counter<K extends string> = Partial<Record<K, number>>;

export function createCreatureInstance(
  speciesId: string,
  customName?: string,
  level = 1,
  generation = 1,
  parentA: string | null = null,
  parentB: string | null = null,
  inheritedGrades?: Partial<Record<'hp' | 'atk' | 'def' | 'mana' | 'mag' | 'spd', GeneGrade>>
): CreatureInstance {
  const species = ALL_CREATURES.find((s) => s.id === speciesId) || ALL_CREATURES[0];
  const grades = {
    hp: inheritedGrades?.hp || 'B',
    atk: inheritedGrades?.atk || 'B',
    def: inheritedGrades?.def || 'B',
    mana: inheritedGrades?.mana || 'B',
    mag: inheritedGrades?.mag || 'B',
    spd: inheritedGrades?.spd || 'B',
  };
  const baseStats = species.baseStats;
  const mul = 1 + (level - 1) * 0.15;
  const maxHp = Math.round(baseStats.hp * mul);
  const maxMana = Math.round(baseStats.mana * mul);

  return {
    id: `c_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`,
    speciesId: species.id,
    name: customName || species.name,
    level,
    xp: 0,
    maxXp: 100 * level,
    rarity: species.rarity,
    element: species.element,
    generation,
    parentA,
    parentB,
    geneGrades: grades,
    stats: {
      hp: maxHp,
      maxHp,
      atk: Math.round(baseStats.atk * mul),
      def: Math.round(baseStats.def * mul),
      mana: maxMana,
      maxMana,
      mag: Math.round(baseStats.mag * mul),
      spd: Math.round(baseStats.spd * mul),
    },
    skills: [...species.defaultSkills],
    trait: species.defaultTrait,
    bond: 60,
    hunger: 90,
  };
}

interface GameData {
  day: number;
  weather: WeatherId;
  forecast: WeatherId;
  coin: number;
  gp: number;
  discovered: string[];
  plots: Plot[];
  seeds: Counter<string>;
  crops: Counter<string>;
  genes: Counter<GeneId>;
  soils: Counter<SoilId>;
  sprinkler: boolean;
  lab: Record<LabUpgradeId, number>;
  stats: GameStats;
  claimed: string[];
  best: Record<string, PlantStats>;
  muted: boolean;
  seenIntro: boolean;
  view: View;
  tool: Tool;
  selectedSeed: string | null;
  selectedSoil: SoilId | null;
  // Creature system expansion state
  creatures: CreatureInstance[];
  eggs: EggInstance[];
  ranchLevel: number;
  activeTeam: string[]; // Up to 3 creature IDs
  discoveredCreatures: string[];
  creatureFoods: Counter<string>;
}

export interface BreedResult extends BreedOutcome {
  isNew: boolean;
  record: boolean;
}

interface GameActions {
  setView: (view: View) => void;
  setTool: (tool: Tool, id?: string | null) => void;
  toggleMute: () => void;
  dismissIntro: () => void;
  applyTool: (plotId: number, fromDrag?: boolean) => void;
  unlockPlot: (plotId: number) => void;
  sleep: () => void;
  buySeed: (id: string, qty: number) => void;
  sellCrop: (id: string, qty: number) => void;
  sellAllCrops: () => void;
  buySoil: (id: SoilId) => void;
  buySprinkler: () => void;
  breed: (a: string, b: string, catalyst: GeneId | null) => BreedResult | null;
  extract: (id: string) => void;
  buyLabUpgrade: (id: LabUpgradeId) => void;
  claimQuest: (id: string) => void;
  resetGame: () => void;
  sfx: (name: Sfx) => void;
  // Creature system actions
  craftCreatureFood: (foodId: string) => void;
  feedCreature: (creatureId: string, foodId: string) => void;
  hatchEgg: (eggId: string) => CreatureInstance | null;
  breedCreatures: (parentAId: string, parentBId: string) => EggInstance | null;
  setTeamSlot: (slotIndex: number, creatureId: string | null) => void;
  upgradeRanch: () => void;
  gainCreatureXp: (creatureId: string, amount: number) => void;
  addEgg: (speciesId: string) => void;
}

export type GameState = GameData & GameActions;

const add = <K extends string>(map: Counter<K>, key: K, n: number): Counter<K> => {
  const next = { ...map };
  const v = (next[key] ?? 0) + n;
  if (v <= 0) delete next[key];
  else next[key] = v;
  return next;
};

const initialStarterCreatureA = createCreatureInstance('firefox', 'EmberFox Vàng', 3);
const initialStarterCreatureB = createCreatureInstance('mossling', 'Mossling Mầm', 3);

const initialData = (): GameData => ({
  day: 1,
  weather: 'sunny',
  forecast: 'rain',
  coin: 120,
  gp: 0,
  discovered: [...STARTER_SPECIES],
  plots: Array.from({ length: GRID_SIZE }, (_, id) => ({
    id, unlocked: START_PLOTS.includes(id), tilled: false, soil: 'normal' as SoilId, plantId: null, growth: 0, watered: false,
  })),
  seeds: { strawberry: 4, tomato: 3, carrot: 3, sunflower: 2, corn: 2 },
  crops: {},
  genes: {},
  soils: {},
  sprinkler: false,
  lab: { amp: 0, scanner: 0, twin: 0 },
  stats: { ...EMPTY_STATS },
  claimed: [],
  best: {},
  muted: false,
  seenIntro: false,
  view: 'farm',
  tool: 'hoe',
  selectedSeed: null,
  selectedSoil: null,
  // Creature defaults
  creatures: [initialStarterCreatureA, initialStarterCreatureB],
  eggs: [
    {
      id: `egg_${Date.now()}`,
      speciesId: 'aquaslime',
      generation: 1,
      daysRemaining: 1,
      parentA: null,
      parentB: null,
      inheritedGrades: { hp: 'B', atk: 'B', def: 'B', mana: 'B', mag: 'B', spd: 'B' },
    },
  ],
  ranchLevel: 1,
  activeTeam: [initialStarterCreatureA.id, initialStarterCreatureB.id],
  discoveredCreatures: ['firefox', 'mossling', 'aquaslime'],
  creatureFoods: { power_berry: 2 },
});

export const questContext = (s: GameData): QuestContext => ({
  stats: s.stats,
  discovered: s.discovered.length,
  epicFound: s.discovered.some((id) => ['epic', 'legendary'].includes(PLANTS[id]?.rarity)),
  plots: s.plots.filter((p) => p.unlocked).length,
});

export const isReady = (p: Plot) => p.plantId !== null && p.growth >= 100;

const ui = () => useUi.getState();

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      const bump = (key: keyof GameStats, n = 1) => set((s) => ({ stats: { ...s.stats, [key]: s.stats[key] + n } }));

      const updatePlot = (id: number, patch: Partial<Plot>) =>
        set((s) => ({ plots: s.plots.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

      const discover = (id: string): boolean => {
        const s = get();
        if (s.discovered.includes(id) || !PLANTS[id]) return false;
        set({ discovered: [...s.discovered, id], gp: s.gp + RARITY_INFO[PLANTS[id].rarity].gp });
        ui().pushDiscovery(id);
        return true;
      };

      const gainGene = (gene: GeneId, source: string) => {
        set((s) => ({ genes: add(s.genes, gene, 1) }));
        bump('genes');
        ui().toast(GENES[gene].icon, `Nhận ${GENES[gene].name} từ ${source}!`, 'good');
      };

      const harvest = (plot: Plot) => {
        const s = get();
        const species = plot.plantId!;
        const mutated = rollFarmMutation(species, s.weather, plot.soil, s.lab.amp * 0.05);
        if (mutated) {
          set((st) => ({ crops: add(st.crops, mutated, 1) }));
          bump('farmMutations');
          ui().fx(plot.id, `✨ ${PLANTS[mutated].name}!`);
          ui().toast('🧬', `Đột biến! ${PLANTS[species].name} đã biến thành ${PLANTS[mutated].name}`, 'rare');
          get().sfx('mutation');
          discover(mutated);
        } else {
          const qty = 1 + (Math.random() < 0.35 ? 1 : 0);
          set((st) => ({ crops: add(st.crops, species, qty) }));
          ui().fx(plot.id, `+${qty} ${PLANTS[species].icon}`);
          get().sfx('harvest');
        }
        const wGene = WEATHERS[s.weather].gene;
        if (wGene && Math.random() < 0.25) gainGene(wGene, WEATHERS[s.weather].name);
        const sGene = SOILS[plot.soil].gene;
        if (sGene && Math.random() < 0.2) gainGene(sGene, SOILS[plot.soil].name);
        bump('harvested');
        updatePlot(plot.id, { plantId: null, growth: 0, watered: false });
      };

      return {
        ...initialData(),

        sfx: (name) => {
          if (!get().muted) playSfx(name);
        },

        setView: (view) => {
          get().sfx('click');
          set({ view });
        },

        setTool: (tool, id = null) => {
          get().sfx('click');
          if (tool === 'seed') set({ tool, selectedSeed: id, selectedSoil: null });
          else if (tool === 'soil') set({ tool, selectedSoil: id as SoilId, selectedSeed: null });
          else set({ tool, selectedSeed: null, selectedSoil: null });
        },

        toggleMute: () =>
          set((s) => {
            const nextMuted = !s.muted;
            setMute(nextMuted);
            if (!nextMuted) startAmbience();
            return { muted: nextMuted };
          }),
        dismissIntro: () => set({ seenIntro: true }),

        applyTool: (plotId, fromDrag = false) => {
          const s = get();
          const plot = s.plots[plotId];
          if (!plot) return;
          if (!plot.unlocked) {
            if (!fromDrag) get().unlockPlot(plotId);
            return;
          }
          // Convenience: any tool (except soil kits) harvests a ripe crop.
          if (isReady(plot) && s.tool !== 'soil') {
            harvest(plot);
            return;
          }
          switch (s.tool) {
            case 'hoe': {
              if (plot.tilled) return;
              updatePlot(plotId, { tilled: true });
              bump('tilled');
              ui().fx(plotId, '⛏️');
              get().sfx('till');
              return;
            }
            case 'water': {
              if (!plot.plantId || plot.watered) return;
              updatePlot(plotId, { watered: true });
              bump('watered');
              ui().fx(plotId, '💧');
              get().sfx('water');
              return;
            }
            case 'seed': {
              const seed = s.selectedSeed;
              if (!seed || plot.plantId) return;
              if (!plot.tilled) {
                if (!fromDrag) {
                  ui().toast('⛏️', 'Hãy dùng cuốc xới đất trước!', 'bad');
                  get().sfx('error');
                }
                return;
              }
              if ((s.seeds[seed] ?? 0) <= 0) {
                if (!fromDrag) ui().toast('🌱', `Hết hạt ${PLANTS[seed].name}`, 'bad');
                return;
              }
              const autoWater = WEATHERS[s.weather].autoWater || s.sprinkler;
              updatePlot(plotId, { plantId: seed, growth: 0, watered: autoWater });
              set((st) => ({ seeds: add(st.seeds, seed, -1) }));
              bump('planted');
              ui().fx(plotId, '🌱');
              get().sfx('plant');
              if ((get().seeds[seed] ?? 0) <= 0) {
                ui().toast('🌱', `Đã dùng hết hạt ${PLANTS[seed].name}`, 'info');
                set({ tool: 'water', selectedSeed: null });
              }
              return;
            }
            case 'soil': {
              const kit = s.selectedSoil;
              if (!kit || plot.plantId || plot.soil === kit) {
                if (plot.plantId && !fromDrag) ui().toast('🪴', 'Hãy thu hoạch trước khi đổi loại đất', 'bad');
                return;
              }
              if ((s.soils[kit] ?? 0) <= 0) return;
              updatePlot(plotId, { soil: kit, tilled: true });
              set((st) => ({ soils: add(st.soils, kit, -1) }));
              ui().fx(plotId, SOILS[kit].icon);
              get().sfx('unlock');
              if ((get().soils[kit] ?? 0) <= 0) set({ tool: 'hoe', selectedSoil: null });
              return;
            }
            case 'harvest':
              return;
          }
        },

        unlockPlot: (plotId) => {
          const s = get();
          const cost = plotUnlockCost(s.plots.filter((p) => p.unlocked).length);
          if (s.coin < cost) {
            ui().toast('🔒', `Cần ${cost} xu để mở ô đất này`, 'bad');
            get().sfx('error');
            return;
          }
          set({ coin: s.coin - cost });
          updatePlot(plotId, { unlocked: true });
          ui().fx(plotId, '🎉');
          ui().toast('🗺️', `Đã mở ô đất mới với giá ${cost} xu`, 'good');
          get().sfx('unlock');
        },

        sleep: () => {
          const s = get();
          const today = WEATHERS[s.weather];
          const weather = s.forecast;
          const autoWater = WEATHERS[weather].autoWater || s.sprinkler;
          const plots = s.plots.map((p) => {
            if (!p.plantId || p.growth >= 100) return { ...p, watered: false };
            let growth = p.growth;
            if (p.watered) {
              growth += (100 / PLANTS[p.plantId].days) * SOILS[p.soil].growthMul * today.growthMul;
              if (growth >= 99) growth = 100;
            }
            return { ...p, growth, watered: growth < 100 && autoWater };
          });
          const eggs = s.eggs.map((e) => ({ ...e, daysRemaining: Math.max(0, e.daysRemaining - 1) }));
          set({ day: s.day + 1, weather, forecast: rollWeather(), plots, eggs });
          bump('days');
          get().sfx('sleep');
          ui().showDay(s.day + 1, weather);
        },

        buySeed: (id, qty) => {
          const s = get();
          const price = (PLANTS[id]?.seedPrice ?? 0) * qty;
          if (!price || s.coin < price) {
            get().sfx('error');
            return;
          }
          set({ coin: s.coin - price, seeds: add(s.seeds, id, qty) });
          get().sfx('coin');
          ui().toast(PLANTS[id].icon, `Đã mua ${qty} hạt ${PLANTS[id].name}`, 'good');
        },

        sellCrop: (id, qty) => {
          const s = get();
          const have = s.crops[id] ?? 0;
          const n = Math.min(have, qty);
          if (n <= 0) return;
          const earned = PLANTS[id].cropPrice * n;
          set({ coin: s.coin + earned, crops: add(s.crops, id, -n) });
          bump('sold', n);
          get().sfx('coin');
          ui().toast('🪙', `+${earned.toLocaleString('vi-VN')} xu`, 'good');
        },

        sellAllCrops: () => {
          const s = get();
          let earned = 0;
          let count = 0;
          for (const [id, q] of Object.entries(s.crops)) {
            earned += PLANTS[id].cropPrice * (q ?? 0);
            count += q ?? 0;
          }
          if (!count) return;
          set({ coin: s.coin + earned, crops: {} });
          bump('sold', count);
          get().sfx('coin');
          ui().toast('🪙', `Đã bán ${count} nông sản, thu ${earned.toLocaleString('vi-VN')} xu`, 'good');
        },

        buySoil: (id) => {
          const s = get();
          const price = SOILS[id].price;
          if (s.coin < price) {
            get().sfx('error');
            return;
          }
          set({ coin: s.coin - price, soils: add(s.soils, id, 1) });
          get().sfx('coin');
          ui().toast(SOILS[id].icon, `Đã mua gói ${SOILS[id].name}`, 'good');
        },

        buySprinkler: () => {
          const s = get();
          if (s.sprinkler || s.coin < SPRINKLER_PRICE) {
            get().sfx('error');
            return;
          }
          set({
            coin: s.coin - SPRINKLER_PRICE,
            sprinkler: true,
            plots: s.plots.map((p) => (p.plantId && p.growth < 100 ? { ...p, watered: true } : p)),
          });
          get().sfx('unlock');
          ui().toast('💦', 'Đã lắp vòi tưới! Cây sẽ được tưới mỗi sáng.', 'good');
        },

        breed: (a, b, catalyst) => {
          const s = get();
          const haveA = s.crops[a] ?? 0;
          const haveB = s.crops[b] ?? 0;
          if (a === b ? haveA < 2 : haveA < 1 || haveB < 1) return null;
          if (catalyst && (s.genes[catalyst] ?? 0) < 1) return null;

          const outcome = breedPlants(a, b, {
            weather: s.weather, catalyst, ampLevel: s.lab.amp, twinChance: s.lab.twin * 0.25,
          });
          let crops = add(s.crops, a, -1);
          crops = add(crops, b, -1);
          const genes = catalyst ? add(s.genes, catalyst, -1) : s.genes;
          const prev = s.best[outcome.result];
          const record = !prev || statTotal(outcome.stats) > statTotal(prev);
          set({
            crops,
            genes,
            seeds: add(s.seeds, outcome.result, outcome.seeds),
            best: record ? { ...s.best, [outcome.result]: outcome.stats } : s.best,
          });
          bump('bred');
          const isNew = discover(outcome.result);
          get().sfx(outcome.recipe ? 'mutation' : 'plant');
          return { ...outcome, isNew, record };
        },

        extract: (id) => {
          const s = get();
          if ((s.crops[id] ?? 0) < 1) return;
          const plant = PLANTS[id];
          const gpGain = { common: 1, uncommon: 3, rare: 6, epic: 12, legendary: 25 }[plant.rarity];
          set({ crops: add(s.crops, id, -1), gp: s.gp + gpGain, stats: { ...s.stats, extracted: s.stats.extracted + 1 } });
          if (plant.gene) gainGene(plant.gene, plant.name);
          else ui().toast('🧪', `Đã tách gene ${plant.name}: +${gpGain} Điểm Gene`, 'info');
          get().sfx('water');
        },

        buyLabUpgrade: (id) => {
          const s = get();
          const level = s.lab[id];
          const cost = LAB_UPGRADES[id].costs[level];
          if (cost === undefined || s.gp < cost) {
            get().sfx('error');
            return;
          }
          set({ gp: s.gp - cost, lab: { ...s.lab, [id]: level + 1 } });
          get().sfx('unlock');
          ui().toast(LAB_UPGRADES[id].icon, `${LAB_UPGRADES[id].name} đã lên cấp ${level + 1}`, 'good');
        },

        craftCreatureFood: (foodId) => {
          const s = get();
          const food = CREATURE_FOODS[foodId];
          if (!food) return;
          for (const [crop, req] of Object.entries(food.cropReq)) {
            if ((s.crops[crop] ?? 0) < req) {
              ui().toast('❌', `Không đủ ${PLANTS[crop]?.name || crop} để chế tạo ${food.name}`, 'bad');
              get().sfx('error');
              return;
            }
          }
          let crops = s.crops;
          for (const [crop, req] of Object.entries(food.cropReq)) {
            crops = add(crops, crop, -req);
          }
          set({ crops, creatureFoods: add(s.creatureFoods, foodId, 1) });
          get().sfx('plant');
          ui().toast(food.icon, `Đã chế tạo 1 ${food.name}!`, 'good');
        },

        feedCreature: (creatureId, foodId) => {
          const s = get();
          const food = CREATURE_FOODS[foodId];
          if (!food || (s.creatureFoods[foodId] ?? 0) < 1) return;

          const creature = s.creatures.find((c) => c.id === creatureId);
          if (!creature) return;

          const boost = food.statBoost;
          const currentStatVal = creature.stats[boost];
          const newStatVal = Math.round(currentStatVal * (1 + food.boostPercent / 100));

          const updatedCreatures = s.creatures.map((c) => {
            if (c.id !== creatureId) return c;
            return {
              ...c,
              bond: Math.min(100, c.bond + 15),
              hunger: Math.min(100, c.hunger + 30),
              stats: { ...c.stats, [boost]: newStatVal },
            };
          });

          set({
            creatures: updatedCreatures,
            creatureFoods: add(s.creatureFoods, foodId, -1),
          });

          get().sfx('coin');
          ui().toast('🍎', `Đã cho ${creature.name} ăn ${food.name}! +${food.boostPercent}% ${boost.toUpperCase()}`, 'good');
        },

        hatchEgg: (eggId) => {
          const s = get();
          const egg = s.eggs.find((e) => e.id === eggId);
          if (!egg || egg.daysRemaining > 0) return null;

          const maxCapacity = [5, 10, 20, 30][s.ranchLevel - 1] || 5;
          if (s.creatures.length >= maxCapacity) {
            ui().toast('🛖', 'Trại thú đã đầy! Nâng cấp Trại thú để nhận thêm.', 'bad');
            get().sfx('error');
            return null;
          }

          const species = ALL_CREATURES.find((sp) => sp.id === egg.speciesId) || ALL_CREATURES[0];
          const newCreature = createCreatureInstance(
            egg.speciesId,
            species.name,
            1,
            egg.generation,
            egg.parentA,
            egg.parentB,
            egg.inheritedGrades
          );

          const discoveredCreatures = s.discoveredCreatures.includes(species.id)
            ? s.discoveredCreatures
            : [...s.discoveredCreatures, species.id];

          set({
            eggs: s.eggs.filter((e) => e.id !== eggId),
            creatures: [...s.creatures, newCreature],
            discoveredCreatures,
          });

          get().sfx('discover');
          ui().pushDiscovery(species.id);
          ui().toast('🥚', `Trứng đã nở thành ${newCreature.name}!`, 'rare');

          return newCreature;
        },

        breedCreatures: (parentAId, parentBId) => {
          const s = get();
          const cA = s.creatures.find((c) => c.id === parentAId);
          const cB = s.creatures.find((c) => c.id === parentBId);
          if (!cA || !cB) return null;

          const combo = CREATURE_BREED_COMBOS.find(
            (cb) => (cb.parentA === cA.speciesId && cb.parentB === cB.speciesId) ||
                    (cb.parentA === cB.speciesId && cb.parentB === cA.speciesId)
          );

          const resultSpecies = combo ? combo.result : (Math.random() < 0.5 ? cA.speciesId : cB.speciesId);
          const gen = Math.max(cA.generation, cB.generation) + 1;

          const inheritedGrades: CreatureGeneGrades = {
            hp: rollInheritedGrade(cA.geneGrades.hp, cB.geneGrades.hp),
            atk: rollInheritedGrade(cA.geneGrades.atk, cB.geneGrades.atk),
            def: rollInheritedGrade(cA.geneGrades.def, cB.geneGrades.def),
            mana: rollInheritedGrade(cA.geneGrades.mana, cB.geneGrades.mana),
            mag: rollInheritedGrade(cA.geneGrades.mag, cB.geneGrades.mag),
            spd: rollInheritedGrade(cA.geneGrades.spd, cB.geneGrades.spd),
          };

          const species = ALL_CREATURES.find((sp) => sp.id === resultSpecies) || ALL_CREATURES[0];
          const newEgg: EggInstance = {
            id: `egg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            speciesId: species.id,
            generation: gen,
            daysRemaining: species.hatchDays,
            parentA: cA.name,
            parentB: cB.name,
            inheritedGrades,
          };

          set({ eggs: [...s.eggs, newEgg] });
          get().sfx('breed');
          ui().toast('🧬', `Tạo thành công Trứng ${species.name} (G${gen})!`, 'good');

          return newEgg;
        },

        setTeamSlot: (slotIndex, creatureId) => {
          const s = get();
          const team = [...s.activeTeam];
          if (creatureId) {
            team[slotIndex] = creatureId;
          } else {
            team.splice(slotIndex, 1);
          }
          set({ activeTeam: team.filter(Boolean) });
          get().sfx('click');
        },

        upgradeRanch: () => {
          const s = get();
          const costs = [200, 500, 1200];
          const cost = costs[s.ranchLevel - 1];
          if (!cost || s.coin < cost) {
            get().sfx('error');
            ui().toast('🛖', `Cần ${cost} xu để nâng cấp Trại thú`, 'bad');
            return;
          }
          set({ coin: s.coin - cost, ranchLevel: s.ranchLevel + 1 });
          get().sfx('unlock');
          ui().toast('🛖', `Trại thú đã được nâng cấp lên Cấp ${s.ranchLevel + 1}!`, 'good');
        },

        gainCreatureXp: (creatureId, amount) => {
          const s = get();
          const updatedCreatures = s.creatures.map((c) => {
            if (c.id !== creatureId) return c;
            let xp = c.xp + amount;
            let level = c.level;
            let maxXp = c.maxXp;
            let stats = { ...c.stats };

            while (xp >= maxXp) {
              xp -= maxXp;
              level += 1;
              maxXp = 100 * level;
              stats = {
                ...stats,
                maxHp: Math.round(stats.maxHp * 1.12),
                hp: Math.round(stats.maxHp * 1.12),
                atk: Math.round(stats.atk * 1.1),
                def: Math.round(stats.def * 1.1),
                maxMana: Math.round(stats.maxMana * 1.1),
                mana: Math.round(stats.maxMana * 1.1),
                mag: Math.round(stats.mag * 1.1),
                spd: Math.round(stats.spd * 1.05),
              };
              ui().toast('⭐', `${c.name} đã thăng lên Cấp ${level}!`, 'rare');
            }
            return { ...c, level, xp, maxXp, stats };
          });
          set({ creatures: updatedCreatures });
        },

        addEgg: (speciesId) => {
          const s = get();
          const species = ALL_CREATURES.find((sp) => sp.id === speciesId) || ALL_CREATURES[0];
          const newEgg: EggInstance = {
            id: `egg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            speciesId: species.id,
            generation: 1,
            daysRemaining: species.hatchDays,
            parentA: null,
            parentB: null,
            inheritedGrades: { hp: 'B', atk: 'B', def: 'B', mana: 'B', mag: 'B', spd: 'B' },
          };
          set({ eggs: [...s.eggs, newEgg] });
          ui().toast('🥚', `Nhận được 1 Trứng ${species.name}!`, 'good');
        },

        claimQuest: (id) => {
          const s = get();
          const quest = QUESTS.find((q) => q.id === id);
          if (!quest || s.claimed.includes(id)) return;
          if (quest.progress(questContext(s)) < quest.target) return;
          const r = quest.reward;
          let seeds = s.seeds;
          let genes = s.genes;
          let soils = s.soils;
          for (const [k, v] of Object.entries(r.seeds ?? {})) seeds = add(seeds, k, v);
          for (const [k, v] of Object.entries(r.genes ?? {})) genes = add(genes, k as GeneId, v ?? 0);
          for (const [k, v] of Object.entries(r.soils ?? {})) soils = add(soils, k as SoilId, v ?? 0);
          set({
            claimed: [...s.claimed, id],
            coin: s.coin + (r.coin ?? 0),
            gp: s.gp + (r.gp ?? 0),
            seeds, genes, soils,
          });
          get().sfx('coin');
          ui().toast(quest.icon, `Hoàn thành mục tiêu: ${quest.title}!`, 'good');
        },

        resetGame: () => {
          const muted = get().muted;
          set({ ...initialData(), muted, seenIntro: true });
        },
      };
    },
    {
      name: 'bloomcode-save',
      version: 2,
      skipHydration: true,
    },
  ),
);

// Auto-sync Zustand state to Dexie IndexedDB for robust offline persistence
if (typeof window !== 'undefined') {
  useGame.subscribe((state) => {
    void saveGameToIndexedDB(
      {
        day: state.day,
        weather: state.weather,
        forecast: state.forecast,
        coin: state.coin,
        gp: state.gp,
        discovered: state.discovered,
        plots: state.plots,
        seeds: state.seeds,
        crops: state.crops,
        genes: state.genes,
        soils: state.soils,
        sprinkler: state.sprinkler,
        lab: state.lab,
        stats: state.stats,
        claimed: state.claimed,
        best: state.best,
      },
      state.day
    );
  });
}
