import type { GeneId } from './genes';
import type { SoilId, WeatherId } from './world';

/**
 * A parent selector:
 *  - a species id, e.g. `strawberry`
 *  - `family:berry` for any species of a family
 *  - `*` for any species
 */
export type ParentSelector = string;

export interface BreedRecipe {
  a: ParentSelector;
  b: ParentSelector;
  /** When both are set, either one satisfies the condition. */
  weather?: WeatherId;
  catalyst?: GeneId;
  result: string;
  chance: number;
}

export interface FarmMutation {
  from: ParentSelector;
  weather?: WeatherId;
  soil?: SoilId;
  result: string;
  chance: number;
}

export const BREED_RECIPES: BreedRecipe[] = [
  // Simple hybrids — always possible
  { a: 'strawberry', b: 'sunflower', result: 'sunberry', chance: 0.8 },
  { a: 'tomato', b: 'strawberry', result: 'cherrytomato', chance: 0.75 },
  { a: 'corn', b: 'sunflower', result: 'popcorn', chance: 0.75 },
  { a: 'tomato', b: 'corn', result: 'chili', chance: 0.75 },
  { a: 'carrot', b: 'corn', result: 'sweetpotato', chance: 0.75 },
  { a: 'tomato', b: 'carrot', result: 'bellpepper', chance: 0.75 },
  { a: 'pumpkin', b: 'strawberry', result: 'watermelon', chance: 0.7 },
  { a: 'grape', b: 'strawberry', result: 'blueberry', chance: 0.7 },

  // Conditional mutations — weather OR gene catalyst
  { a: 'strawberry', b: '*', weather: 'fullmoon', catalyst: 'moon', result: 'moonberry', chance: 0.55 },
  { a: 'strawberry', b: '*', weather: 'snow', catalyst: 'frost', result: 'frostberry', chance: 0.5 },
  { a: 'carrot', b: '*', weather: 'snow', catalyst: 'frost', result: 'frostroot', chance: 0.5 },
  { a: 'corn', b: '*', weather: 'heatwave', catalyst: 'fire', result: 'embercorn', chance: 0.5 },
  { a: 'corn', b: '*', weather: 'fullmoon', catalyst: 'moon', result: 'nightcorn', chance: 0.5 },
  { a: 'mushroom', b: '*', weather: 'fullmoon', catalyst: 'moon', result: 'glowshroom', chance: 0.55 },
  { a: 'tomato', b: '*', weather: 'thunderstorm', catalyst: 'thunder', result: 'voltomato', chance: 0.5 },

  // Epic
  { a: 'strawberry', b: 'voltomato', result: 'thunderberry', chance: 0.5 },
  { a: 'strawberry', b: '*', weather: 'thunderstorm', catalyst: 'thunder', result: 'thunderberry', chance: 0.3 },
  { a: 'family:berry', b: 'chili', weather: 'heatwave', catalyst: 'fire', result: 'magmaberry', chance: 0.45 },
  { a: 'sunflower', b: 'sunberry', weather: 'heatwave', catalyst: 'solar', result: 'goldensunflower', chance: 0.5 },
  { a: 'frostroot', b: '*', catalyst: 'crystal', result: 'crystalcarrot', chance: 0.45 },
  { a: 'carrot', b: '*', catalyst: 'crystal', result: 'crystalcarrot', chance: 0.25 },
  { a: 'pumpkin', b: '*', weather: 'meteor', catalyst: 'star', result: 'stardustpumpkin', chance: 0.45 },

  // Legendary
  { a: 'grape', b: 'stardustpumpkin', weather: 'meteor', catalyst: 'star', result: 'galaxygrape', chance: 0.4 },
  { a: 'goldensunflower', b: 'crystalcarrot', weather: 'meteor', catalyst: 'crystal', result: 'prismabloom', chance: 0.35 },
];

export const FARM_MUTATIONS: FarmMutation[] = [
  { from: 'strawberry', weather: 'thunderstorm', result: 'thunderberry', chance: 0.2 },
  { from: 'strawberry', weather: 'fullmoon', result: 'moonberry', chance: 0.3 },
  { from: 'strawberry', weather: 'snow', result: 'frostberry', chance: 0.3 },
  { from: 'strawberry', soil: 'frost', result: 'frostberry', chance: 0.3 },
  { from: 'strawberry', weather: 'heatwave', result: 'sunberry', chance: 0.3 },
  { from: 'family:berry', soil: 'volcanic', result: 'magmaberry', chance: 0.2 },
  { from: 'carrot', weather: 'snow', result: 'frostroot', chance: 0.35 },
  { from: 'carrot', soil: 'frost', result: 'frostroot', chance: 0.35 },
  { from: 'carrot', soil: 'crystal', result: 'crystalcarrot', chance: 0.3 },
  { from: 'corn', weather: 'heatwave', result: 'embercorn', chance: 0.3 },
  { from: 'corn', soil: 'volcanic', result: 'embercorn', chance: 0.35 },
  { from: 'corn', weather: 'fullmoon', result: 'nightcorn', chance: 0.35 },
  { from: 'tomato', weather: 'thunderstorm', result: 'voltomato', chance: 0.3 },
  { from: 'mushroom', weather: 'fullmoon', result: 'glowshroom', chance: 0.4 },
  { from: 'sunflower', weather: 'heatwave', result: 'goldensunflower', chance: 0.12 },
  { from: 'pumpkin', weather: 'meteor', result: 'stardustpumpkin', chance: 0.4 },
  { from: 'grape', weather: 'meteor', result: 'galaxygrape', chance: 0.06 },
];
