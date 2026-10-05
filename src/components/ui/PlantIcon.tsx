import type { CSSProperties } from 'react';
import { PLANTS } from '@/data/plants';

export type PlantStage = 'seedling' | 'sprout' | 'young' | 'mature';

interface Props {
  id: string;
  size?: number;
  stage?: PlantStage;
  silhouette?: boolean;
  float?: boolean;
  className?: string;
}

const STAGE_EMOJI: Record<Exclude<PlantStage, 'mature'>, string> = {
  seedling: '🌱',
  sprout: '🌱',
  young: '🌿',
};

const STAGE_SCALE: Record<PlantStage, number> = {
  seedling: 0.55,
  sprout: 0.8,
  young: 0.95,
  mature: 1,
};

export default function PlantIcon({ id, size = 48, stage = 'mature', silhouette = false, float = false, className = '' }: Props) {
  const plant = PLANTS[id];
  if (!plant) return null;
  const look = plant.look ?? {};
  const mature = stage === 'mature';
  const emoji = mature ? plant.icon : STAGE_EMOJI[stage];

  const style = {
    fontSize: size * STAGE_SCALE[stage],
    '--pf': mature && look.filter && !look.rainbow ? look.filter : 'none',
    '--aura': look.aura ?? 'transparent',
  } as CSSProperties;

  const classes = ['plant', mature && look.rainbow && !silhouette ? 'plant--rainbow' : '', silhouette ? 'plant--silhouette' : '', float ? 'plant--float' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} style={style} role="img" aria-label={silhouette ? 'Loài chưa khám phá' : plant.name}>
      {look.aura && !silhouette && (mature || stage === 'young') && <span className="plant__aura" aria-hidden />}
      <span className="plant__emoji">{emoji}</span>
      {look.badge && mature && !silhouette && <span className="plant__badge" aria-hidden>{look.badge}</span>}
    </span>
  );
}

export function stageFor(growth: number): PlantStage {
  if (growth >= 100) return 'mature';
  if (growth >= 60) return 'young';
  if (growth >= 25) return 'sprout';
  return 'seedling';
}
