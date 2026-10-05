import { PLANTS, type PlantStats } from '@/data/plants';
import { RARITY_ORDER, type GeneId } from '@/data/genes';
import { BREED_RECIPES, FARM_MUTATIONS, type BreedRecipe, type FarmMutation, type ParentSelector } from '@/data/recipes';
import type { SoilId, WeatherId } from '@/data/world';

const rarityRank = (speciesId: string) => RARITY_ORDER.indexOf(PLANTS[speciesId]?.rarity ?? 'common');

export function matchesSelector(selector: ParentSelector, speciesId: string): boolean {
  if (selector === '*') return true;
  if (selector.startsWith('family:')) return PLANTS[speciesId]?.family === selector.slice(7);
  return selector === speciesId;
}

export function parentsMatch(r: BreedRecipe, a: string, b: string): boolean {
  return (matchesSelector(r.a, a) && matchesSelector(r.b, b)) || (matchesSelector(r.a, b) && matchesSelector(r.b, a));
}

export function isConditional(r: BreedRecipe) {
  return Boolean(r.weather || r.catalyst);
}

export function conditionMet(r: BreedRecipe, weather: WeatherId, catalyst: GeneId | null): boolean {
  if (!isConditional(r)) return true;
  return (r.weather !== undefined && r.weather === weather) || (r.catalyst !== undefined && r.catalyst === catalyst);
}

/** All recipes that could ever apply to this pair (ignoring conditions). Sorted rarest first. */
export function recipesForPair(a: string, b: string): BreedRecipe[] {
  return BREED_RECIPES.filter((r) => parentsMatch(r, a, b) && r.result !== a && r.result !== b).sort(
    (x, y) => rarityRank(y.result) - rarityRank(x.result) || y.chance - x.chance,
  );
}

export const clampChance = (c: number) => Math.min(0.95, Math.max(0, c));

export interface BreedOutcome {
  result: string;
  recipe: BreedRecipe | null;
  seeds: number;
  stats: PlantStats;
}

const clampStat = (n: number) => Math.max(1, Math.min(100, Math.round(n)));

function rollStats(a: string, b: string, result: string): PlantStats {
  const pa = PLANTS[a].stats;
  const pb = PLANTS[b].stats;
  const base = PLANTS[result].stats;
  const roll = (k: keyof PlantStats) => clampStat((pa[k] + pb[k]) / 4 + base[k] / 2 + (Math.random() * 22 - 8));
  return { growth: roll('growth'), sweetness: roll('sweetness'), size: roll('size'), resistance: roll('resistance') };
}

export function breedPlants(
  a: string,
  b: string,
  ctx: { weather: WeatherId; catalyst: GeneId | null; ampLevel: number; twinChance: number },
): BreedOutcome {
  const candidates = recipesForPair(a, b).filter((r) => conditionMet(r, ctx.weather, ctx.catalyst));
  for (const r of candidates) {
    if (Math.random() < clampChance(r.chance + ctx.ampLevel * 0.1)) {
      const seeds = 1 + (Math.random() < ctx.twinChance ? 1 : 0);
      return { result: r.result, recipe: r, seeds, stats: rollStats(a, b, r.result) };
    }
  }
  // No mutation: inherit from a parent. Same-species pairs clone into two seeds.
  const result = a === b ? a : Math.random() < 0.5 ? a : b;
  const seeds = (a === b ? 2 : 1) + (Math.random() < ctx.twinChance ? 1 : 0);
  return { result, recipe: null, seeds, stats: rollStats(a, b, result) };
}

export function farmMutationsFor(speciesId: string): FarmMutation[] {
  return FARM_MUTATIONS.filter((m) => matchesSelector(m.from, speciesId) && m.result !== speciesId);
}

export function rollFarmMutation(speciesId: string, weather: WeatherId, soil: SoilId, bonus: number): string | null {
  const options = farmMutationsFor(speciesId)
    .filter((m) => (m.weather && m.weather === weather) || (m.soil && m.soil === soil))
    .sort((x, y) => rarityRank(y.result) - rarityRank(x.result));
  for (const m of options) {
    if (Math.random() < clampChance(m.chance + bonus)) return m.result;
  }
  return null;
}

/** How a species can be obtained — used by the GeneDex / Gene Scanner. */
export function originsOf(speciesId: string) {
  return {
    breed: BREED_RECIPES.filter((r) => r.result === speciesId),
    farm: FARM_MUTATIONS.filter((m) => m.result === speciesId),
  };
}

export const statTotal = (s: PlantStats) => s.growth + s.sweetness + s.size + s.resistance;
