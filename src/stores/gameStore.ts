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
import { playSfx, type Sfx } from '@/lib/sfx';
import { useUi } from './uiStore';

export type View = 'farm' | 'lab' | 'genedex' | 'shop' | 'inventory';
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
    name: 'Mutation Amplifier', icon: '📡', costs: [20, 45, 90],
    description: ['+10% breeding mutation chance', '+20% breeding mutation chance', '+30% breeding mutation chance'],
  },
  scanner: {
    name: 'Gene Scanner', icon: '🔍', costs: [25, 60],
    description: ['GeneDex reveals mutation conditions', 'GeneDex reveals full recipes'],
  },
  twin: {
    name: 'Twin Incubator', icon: '🥚', costs: [40, 90],
    description: ['25% chance of a bonus seed when breeding', '50% chance of a bonus seed when breeding'],
  },
};

type Counter<K extends string> = Partial<Record<K, number>>;

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
}

export type GameState = GameData & GameActions;

const add = <K extends string>(map: Counter<K>, key: K, n: number): Counter<K> => {
  const next = { ...map };
  const v = (next[key] ?? 0) + n;
  if (v <= 0) delete next[key];
  else next[key] = v;
  return next;
};

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
        ui().toast(GENES[gene].icon, `${GENES[gene].name} collected from ${source}!`, 'good');
      };

      const harvest = (plot: Plot) => {
        const s = get();
        const species = plot.plantId!;
        const mutated = rollFarmMutation(species, s.weather, plot.soil, s.lab.amp * 0.05);
        if (mutated) {
          set((st) => ({ crops: add(st.crops, mutated, 1) }));
          bump('farmMutations');
          ui().fx(plot.id, `✨ ${PLANTS[mutated].name}!`);
          ui().toast('🧬', `Mutation! ${PLANTS[species].name} became ${PLANTS[mutated].name}`, 'rare');
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

        toggleMute: () => set((s) => ({ muted: !s.muted })),
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
                  ui().toast('⛏️', 'Till the soil with the Hoe first!', 'bad');
                  get().sfx('error');
                }
                return;
              }
              if ((s.seeds[seed] ?? 0) <= 0) {
                if (!fromDrag) ui().toast('🌱', `No ${PLANTS[seed].name} seeds left`, 'bad');
                return;
              }
              const autoWater = WEATHERS[s.weather].autoWater || s.sprinkler;
              updatePlot(plotId, { plantId: seed, growth: 0, watered: autoWater });
              set((st) => ({ seeds: add(st.seeds, seed, -1) }));
              bump('planted');
              ui().fx(plotId, '🌱');
              get().sfx('plant');
              if ((get().seeds[seed] ?? 0) <= 0) {
                ui().toast('🌱', `Out of ${PLANTS[seed].name} seeds`, 'info');
                set({ tool: 'water', selectedSeed: null });
              }
              return;
            }
            case 'soil': {
              const kit = s.selectedSoil;
              if (!kit || plot.plantId || plot.soil === kit) {
                if (plot.plantId && !fromDrag) ui().toast('🪴', 'Harvest the plot before changing its soil', 'bad');
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
            ui().toast('🔒', `Need ${cost} coins to unlock this plot`, 'bad');
            get().sfx('error');
            return;
          }
          set({ coin: s.coin - cost });
          updatePlot(plotId, { unlocked: true });
          ui().fx(plotId, '🎉');
          ui().toast('🗺️', `New plot unlocked for ${cost} coins`, 'good');
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
          set({ day: s.day + 1, weather, forecast: rollWeather(), plots });
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
          ui().toast(PLANTS[id].icon, `Bought ${qty} ${PLANTS[id].name} seed${qty > 1 ? 's' : ''}`, 'good');
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
          ui().toast('🪙', `+${earned.toLocaleString()} coins`, 'good');
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
          ui().toast('🪙', `Sold ${count} crops for ${earned.toLocaleString()} coins`, 'good');
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
          ui().toast(SOILS[id].icon, `Bought ${SOILS[id].name} kit`, 'good');
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
          ui().toast('💦', 'Sprinkler installed! Crops are watered every morning.', 'good');
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
          else ui().toast('🧪', `Extracted ${plant.name}: +${gpGain} Gene Points`, 'info');
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
          ui().toast(LAB_UPGRADES[id].icon, `${LAB_UPGRADES[id].name} upgraded to Lv ${level + 1}`, 'good');
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
          ui().toast(quest.icon, `Goal complete: ${quest.title}!`, 'good');
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
