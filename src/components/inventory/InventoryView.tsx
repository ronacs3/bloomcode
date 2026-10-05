'use client';

import { useState, type CSSProperties } from 'react';
import { useGame } from '@/stores/gameStore';
import { PLANTS } from '@/data/plants';
import { GENES, GENE_IDS, RARITY_INFO } from '@/data/genes';
import { SOILS, SOIL_KIT_IDS } from '@/data/world';
import PlantIcon from '@/components/ui/PlantIcon';
import { Modal } from '@/components/ui/Overlays';

type Filter = 'all' | 'seed' | 'crop' | 'gene' | 'soil';

export default function InventoryView() {
  const seeds = useGame((s) => s.seeds);
  const crops = useGame((s) => s.crops);
  const genes = useGame((s) => s.genes);
  const soils = useGame((s) => s.soils);
  const day = useGame((s) => s.day);
  const setTool = useGame((s) => s.setTool);
  const setView = useGame((s) => s.setView);
  const resetGame = useGame((s) => s.resetGame);
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmReset, setConfirmReset] = useState(false);

  const byDex = ([a]: [string, unknown], [b]: [string, unknown]) => PLANTS[a].dex - PLANTS[b].dex;
  const seedList = Object.entries(seeds).filter(([, q]) => (q ?? 0) > 0).sort(byDex);
  const cropList = Object.entries(crops).filter(([, q]) => (q ?? 0) > 0).sort(byDex);
  const geneList = GENE_IDS.filter((g) => (genes[g] ?? 0) > 0);
  const soilList = SOIL_KIT_IDS.filter((s) => (soils[s] ?? 0) > 0);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const counts: Record<Filter, number> = {
    seed: sum(seedList.map(([, q]) => q ?? 0)),
    crop: sum(cropList.map(([, q]) => q ?? 0)),
    gene: sum(geneList.map((g) => genes[g] ?? 0)),
    soil: sum(soilList.map((s) => soils[s] ?? 0)),
    all: 0,
  };
  counts.all = counts.seed + counts.crop + counts.gene + counts.soil;

  const show = (f: Filter) => filter === 'all' || filter === f;
  const isEmpty = counts[filter] === 0;

  const TABS: [Filter, string][] = [
    ['all', '🎒 All'],
    ['seed', '🌱 Seeds'],
    ['crop', '🧺 Crops'],
    ['gene', '🧪 Genes'],
    ['soil', '🟫 Soil'],
  ];

  return (
    <section className="panel view-enter" aria-labelledby="bag-title">
      <div className="panel__head">
        <div className="panel__title">
          <span className="panel__title-icon" aria-hidden>🎒</span>
          <div>
            <h2 id="bag-title">Backpack</h2>
            <div className="panel__sub">Everything you have grown, bred and collected.</div>
          </div>
        </div>
        <div className="tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" id={`bag-tab-${id}`} className="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>
              {label} <span className="tab__count">{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="empty">
          <span className="empty__icon">☁️</span>
          Nothing here yet.
        </div>
      ) : (
        <div className="grid-cards">
          {show('seed') &&
            seedList.map(([id, q]) => (
              <div key={`seed-${id}`} className="card">
                <span className="card__qty">×{q}</span>
                <span className="card__badge chip chip--ok">Seed</span>
                <span style={{ position: 'relative' }}>
                  <PlantIcon id={id} size={50} />
                  <span style={{ position: 'absolute', left: -10, bottom: -4, fontSize: 20 }} aria-hidden>🌰</span>
                </span>
                <div className="card__name">{PLANTS[id].name}</div>
                <div className="card__meta">Grows in {PLANTS[id].days} days</div>
                <div className="card__actions">
                  <button
                    id={`bag-plant-${id}`}
                    className="btn btn--sm"
                    onClick={() => {
                      setTool('seed', id);
                      setView('farm');
                    }}
                  >
                    Plant
                  </button>
                </div>
              </div>
            ))}
          {show('crop') &&
            cropList.map(([id, q]) => {
              const p = PLANTS[id];
              const rc = RARITY_INFO[p.rarity].color;
              return (
                <div key={`crop-${id}`} className={`card ${p.rarity !== 'common' ? 'card--rare' : ''}`} style={{ '--rc': rc } as CSSProperties}>
                  <span className="card__qty">×{q}</span>
                  <span className="card__badge rarity" style={{ '--rc': rc } as CSSProperties}>{RARITY_INFO[p.rarity].label}</span>
                  <PlantIcon id={id} size={56} />
                  <div className="card__name">{p.name}</div>
                  <div className="card__meta">Worth 🪙 {p.cropPrice}</div>
                  <div className="card__actions">
                    <button id={`bag-lab-${id}`} className="btn btn--sm btn--teal" onClick={() => setView('lab')}>Gene Lab</button>
                  </div>
                </div>
              );
            })}
          {show('gene') &&
            geneList.map((g) => (
              <div key={`gene-${g}`} className="card" style={{ '--rc': GENES[g].color } as CSSProperties}>
                <span className="card__qty">×{genes[g]}</span>
                <span className="card__badge chip" style={{ background: GENES[g].color, color: '#fff' }}>Gene</span>
                <span style={{ fontSize: 46, filter: `drop-shadow(0 0 12px ${GENES[g].color})` }} aria-hidden>{GENES[g].icon}</span>
                <div className="card__name">{GENES[g].name}</div>
                <div className="card__meta">{GENES[g].description}</div>
              </div>
            ))}
          {show('soil') &&
            soilList.map((s) => (
              <div key={`soil-${s}`} className="card">
                <span className="card__qty">×{soils[s]}</span>
                <span style={{ fontSize: 46 }} aria-hidden>{SOILS[s].icon}</span>
                <div className="card__name">{SOILS[s].name}</div>
                <div className="card__meta">{SOILS[s].description}</div>
                <div className="card__actions">
                  <button
                    id={`bag-soil-${s}`}
                    className="btn btn--sm btn--gold"
                    onClick={() => {
                      setTool('soil', s);
                      setView('farm');
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="row row--between row--wrap mt-6" style={{ paddingTop: 16, borderTop: '2px dashed var(--cream-3)' }}>
        <span className="muted" style={{ fontWeight: 700, fontSize: 13 }}>💾 Progress auto-saves in this browser · Day {day}</span>
        <button id="reset-save" className="btn btn--sm btn--ghost" onClick={() => setConfirmReset(true)}>Reset save</button>
      </div>

      {confirmReset && (
        <Modal onClose={() => setConfirmReset(false)} labelledBy="reset-title">
          <div className="intro">
            <div className="intro__hero" aria-hidden><span>🥀</span></div>
            <h2 id="reset-title">Start a brand-new farm?</h2>
            <p className="muted mt-2" style={{ fontWeight: 700 }}>All crops, coins and GeneDex progress will be lost.</p>
            <div className="row mt-6" style={{ justifyContent: 'center' }}>
              <button id="reset-cancel" className="btn btn--ghost" onClick={() => setConfirmReset(false)}>Keep playing</button>
              <button
                id="reset-confirm"
                className="btn btn--berry"
                onClick={() => {
                  resetGame();
                  setConfirmReset(false);
                }}
              >
                Reset everything
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
