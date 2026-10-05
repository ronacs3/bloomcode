'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useGame, LAB_UPGRADES, type BreedResult, type LabUpgradeId } from '@/stores/gameStore';
import { PLANTS, type PlantStats } from '@/data/plants';
import { GENES, GENE_IDS, RARITY_INFO, type GeneId } from '@/data/genes';
import { WEATHERS } from '@/data/world';
import { recipesForPair, conditionMet, clampChance, isConditional, statTotal } from '@/lib/breeding';
import PlantIcon from '@/components/ui/PlantIcon';
import { Modal } from '@/components/ui/Overlays';

type Tab = 'breed' | 'extract' | 'upgrades';

const STAT_META: { key: keyof PlantStats; icon: string; label: string }[] = [
  { key: 'growth', icon: '🌱', label: 'Growth' },
  { key: 'sweetness', icon: '🍯', label: 'Sweetness' },
  { key: 'size', icon: '📏', label: 'Size' },
  { key: 'resistance', icon: '🛡️', label: 'Resistance' },
];

function StatBars({ stats }: { stats: PlantStats }) {
  return (
    <div className="pod__stats">
      {STAT_META.map((m) => (
        <div key={m.key} className="statline" title={m.label}>
          <span aria-hidden>{m.icon}</span>
          <div className="bar"><div className="bar__fill" style={{ width: `${stats[m.key]}%` }} /></div>
          <span className="statline__val">{stats[m.key]}</span>
        </div>
      ))}
    </div>
  );
}

const BUBBLES = [0, 1, 2, 3, 4];

function Pod({ id, label, onClear, disabled }: { id: string | null; label: string; onClear: () => void; disabled: boolean }) {
  return (
    <div className={`pod ${id ? 'pod--filled' : ''}`}>
      <div className="pod__glass">
        {id && (
          <div className="pod__bubbles" aria-hidden>
            {BUBBLES.map((i) => (
              <span key={i} style={{ left: `${18 + i * 16}%`, animationDelay: `${i * 0.55}s` }} />
            ))}
          </div>
        )}
        {id ? (
          <div className="pod__content"><PlantIcon id={id} size={76} float /></div>
        ) : (
          <div className="pod__empty">Select<br />{label}</div>
        )}
        {id && !disabled && (
          <button className="pod__clear" onClick={onClear} aria-label={`Remove ${label}`}>×</button>
        )}
      </div>
      <div className="pod__name">{id ? PLANTS[id].name : '— empty —'}</div>
      {id && <StatBars stats={PLANTS[id].stats} />}
    </div>
  );
}

function BreedTab() {
  const crops = useGame((s) => s.crops);
  const genes = useGame((s) => s.genes);
  const weather = useGame((s) => s.weather);
  const discovered = useGame((s) => s.discovered);
  const lab = useGame((s) => s.lab);
  const breed = useGame((s) => s.breed);
  const sfx = useGame((s) => s.sfx);

  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [catalyst, setCatalyst] = useState<GeneId | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BreedResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const cropList = Object.entries(crops)
    .filter(([, q]) => (q ?? 0) > 0)
    .sort(([x], [y]) => PLANTS[x].dex - PLANTS[y].dex);
  const geneList = GENE_IDS.filter((g) => (genes[g] ?? 0) > 0);

  const reserved = (id: string) => (a === id ? 1 : 0) + (b === id ? 1 : 0);
  const available = (id: string) => (crops[id] ?? 0) - reserved(id);

  // Drop selections that are no longer affordable (e.g. after selling crops).
  const validA = a && (crops[a] ?? 0) >= 1 ? a : null;
  const validB = b && (crops[b] ?? 0) >= (validA === b ? 2 : 1) ? b : null;
  const activeCatalyst = catalyst && (genes[catalyst] ?? 0) > 0 ? catalyst : null;

  const pick = (id: string) => {
    if (busy || available(id) <= 0) return;
    sfx('click');
    if (!validA) setA(id);
    else if (!validB) setB(id);
    else setB(id);
  };

  const recipes = validA && validB ? recipesForPair(validA, validB) : [];
  const amp = lab.amp * 0.1;

  const start = () => {
    if (!validA || !validB || busy) return;
    setBusy(true);
    sfx('breed');
    timer.current = setTimeout(() => {
      const r = breed(validA, validB, activeCatalyst);
      setBusy(false);
      setA(null);
      setB(null);
      setCatalyst(null);
      if (r) setResult(r);
    }, 2200);
  };

  const w = WEATHERS[weather];

  return (
    <>
      <div className="reactor">
        <Pod id={validA} label="Parent A" onClear={() => setA(null)} disabled={busy} />

        <div className={`core ${busy ? 'core--active' : ''}`}>
          <div className="core__ring">
            <span className="core__beam core__beam--l" />
            <span className="core__dna" aria-hidden>🧬</span>
            <span className="core__beam core__beam--r" />
          </div>
          <span className="cond" title="Today's weather influences mutations">{w.icon} {w.name}</span>
          <div className="stack" style={{ alignItems: 'center', gap: 6 }}>
            <span className="lab-label">Gene catalyst</span>
            {geneList.length === 0 ? (
              <span className="cond">No gene samples yet</span>
            ) : (
              <div className="catalyst">
                {geneList.map((g) => (
                  <button
                    key={g}
                    id={`catalyst-${g}`}
                    className="catalyst__btn"
                    style={{ '--gc': GENES[g].color } as CSSProperties}
                    aria-pressed={activeCatalyst === g}
                    disabled={busy}
                    onClick={() => setCatalyst(activeCatalyst === g ? null : g)}
                    title={GENES[g].description}
                  >
                    {GENES[g].icon} {genes[g]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button id="breed-button" className="btn btn--teal btn--lg" disabled={!validA || !validB || busy} onClick={start}>
            {busy ? 'Splicing…' : 'BREED'}
          </button>
        </div>

        <Pod id={validB} label="Parent B" onClear={() => setB(null)} disabled={busy} />
      </div>

      {validA && validB && (
        <div className="resonance">
          <span className="lab-label">Gene resonance</span>
          {recipes.length === 0 ? (
            <p style={{ marginTop: 8, fontWeight: 700, color: '#a9d6d3', fontSize: 14 }}>
              {validA === validB
                ? '🧫 Cloning — two identical parents produce 2 seeds of the same species.'
                : '〰️ No resonance. The offspring will inherit genes from one parent.'}
            </p>
          ) : (
            <div className="resonance__list">
              {recipes.map((r, i) => {
                const known = discovered.includes(r.result);
                const met = conditionMet(r, weather, activeCatalyst);
                const revealConds = known || lab.scanner >= 1 || met;
                return (
                  <div key={i} className={`resonance__item ${met ? 'resonance__item--active' : ''}`}>
                    <PlantIcon id={r.result} size={34} silhouette={!known} />
                    <div>
                      <div>{known ? PLANTS[r.result].name : '??? Unknown species'}</div>
                      <small>
                        {met ? `${Math.round(clampChance(r.chance + amp) * 100)}% chance` : 'Inactive'}
                        {isConditional(r) && ' · needs '}
                        {isConditional(r) && (
                          <>
                            {r.weather && (
                              <span className={`cond ${r.weather === weather ? 'cond--met' : ''}`}>
                                {revealConds ? `${WEATHERS[r.weather].icon} ${WEATHERS[r.weather].name}` : '❔ weather'}
                              </span>
                            )}
                            {r.weather && r.catalyst && ' or '}
                            {r.catalyst && (
                              <span className={`cond ${r.catalyst === activeCatalyst ? 'cond--met' : ''}`}>
                                {revealConds ? `${GENES[r.catalyst].icon} ${GENES[r.catalyst].name}` : '❔ gene'}
                              </span>
                            )}
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="tray">
        <div className="row row--between">
          <span className="lab-label">Crop samples</span>
          <span className="cond">{cropList.length} types</span>
        </div>
        {cropList.length === 0 ? (
          <p style={{ padding: '18px 0 6px', textAlign: 'center', color: '#8fbfc0', fontWeight: 700 }}>
            No crops yet — harvest something on the farm first 🧑‍🌾
          </p>
        ) : (
          <div className="tray__row">
            {cropList.map(([id]) => (
              <button
                key={id}
                id={`tray-${id}`}
                className="tray__item"
                onClick={() => pick(id)}
                disabled={busy || available(id) <= 0}
                title={`Add ${PLANTS[id].name}`}
              >
                <PlantIcon id={id} size={38} />
                <span className="n">{PLANTS[id].name}</span>
                <span className="q">{available(id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {result && <BreedResultModal result={result} onClose={() => setResult(null)} />}
    </>
  );
}

function BreedResultModal({ result, onClose }: { result: BreedResult; onClose: () => void }) {
  const plant = PLANTS[result.result];
  const rarity = RARITY_INFO[plant.rarity];
  const title = result.isNew ? 'New Species!' : result.recipe ? 'Mutation Success!' : 'Seeds Collected';
  return (
    <Modal onClose={onClose} variant="lab" labelledBy="breed-result-title">
      <div className="detail-hero">
        <span className="lab-label">{title}</span>
        <PlantIcon id={plant.id} size={110} float />
        <span className="rarity" style={{ '--rc': rarity.color } as CSSProperties}>{rarity.label}</span>
        <h2 id="breed-result-title" style={{ fontSize: 28, color: '#fff' }}>{plant.name}</h2>
        <span className="cond cond--met">+{result.seeds} seed{result.seeds > 1 ? 's' : ''} added to your bag</span>
      </div>
      <div className="resonance">
        <div className="row row--between">
          <span className="lab-label">Rolled genes · total {statTotal(result.stats)}</span>
          {result.record && <span className="cond cond--met">🏅 New best specimen</span>}
        </div>
        <div className="mt-2" style={{ display: 'grid', gap: 6 }}>
          {STAT_META.map((m) => (
            <div key={m.key} className="statline">
              <span aria-hidden>{m.icon}</span>
              <div className="bar"><div className="bar__fill" style={{ width: `${result.stats[m.key]}%` }} /></div>
              <span className="statline__val">{result.stats[m.key]}</span>
            </div>
          ))}
        </div>
      </div>
      <button id="breed-result-close" className="btn btn--teal btn--block btn--lg mt-4" onClick={onClose}>Continue</button>
    </Modal>
  );
}

function ExtractTab() {
  const crops = useGame((s) => s.crops);
  const extract = useGame((s) => s.extract);
  const list = Object.entries(crops)
    .filter(([, q]) => (q ?? 0) > 0)
    .sort(([x], [y]) => PLANTS[x].dex - PLANTS[y].dex);

  return (
    <>
      <p style={{ color: '#a9d6d3', fontWeight: 700, marginBottom: 16 }}>
        Break a crop down into its genetic code. Crops with a special gene produce a <b style={{ color: '#fff' }}>gene sample</b> you can use as a breeding catalyst. Every extraction also grants Gene Points.
      </p>
      {list.length === 0 ? (
        <div className="empty" style={{ color: '#8fbfc0' }}>
          <span className="empty__icon">🧪</span>
          Nothing to extract — harvest crops first.
        </div>
      ) : (
        <div className="grid-cards">
          {list.map(([id, q]) => {
            const p = PLANTS[id];
            const gp = { common: 1, uncommon: 3, rare: 6, epic: 12, legendary: 25 }[p.rarity];
            return (
              <div key={id} className="lab-card">
                <span className="card__qty" style={{ background: 'var(--teal)', color: '#052a27' }}>×{q}</span>
                <PlantIcon id={id} size={52} />
                <div className="card__name">{p.name}</div>
                <div className="card__meta">
                  {p.gene ? `${GENES[p.gene].icon} ${GENES[p.gene].name} + ` : ''}🧬 {gp} GP
                </div>
                <button id={`extract-${id}`} className="btn btn--teal btn--sm btn--block" onClick={() => extract(id)}>
                  Extract
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function UpgradesTab() {
  const lab = useGame((s) => s.lab);
  const gp = useGame((s) => s.gp);
  const buy = useGame((s) => s.buyLabUpgrade);

  return (
    <>
      <p style={{ color: '#a9d6d3', fontWeight: 700, marginBottom: 16 }}>
        Spend Gene Points (earned from discoveries and extraction) to upgrade your lab equipment. You have <b style={{ color: '#fff' }}>🧬 {gp}</b>.
      </p>
      {(Object.keys(LAB_UPGRADES) as LabUpgradeId[]).map((id) => {
        const u = LAB_UPGRADES[id];
        const level = lab[id];
        const cost = u.costs[level];
        const maxed = cost === undefined;
        return (
          <div key={id} className="upgrade">
            <span className="upgrade__icon" aria-hidden>{u.icon}</span>
            <div className="upgrade__body">
              <div className="upgrade__name">{u.name}</div>
              <div className="pips" aria-label={`Level ${level} of ${u.costs.length}`}>
                {u.costs.map((_, i) => <span key={i} className={i < level ? 'on' : ''} />)}
              </div>
              <div className="upgrade__desc">
                {maxed ? `MAX — ${u.description[level - 1]}` : `Next: ${u.description[level]}`}
              </div>
            </div>
            <button id={`upgrade-${id}`} className="btn btn--violet" disabled={maxed || gp < cost} onClick={() => buy(id)}>
              {maxed ? 'Maxed' : `🧬 ${cost}`}
            </button>
          </div>
        );
      })}
    </>
  );
}

export default function GeneLabView() {
  const [tab, setTab] = useState<Tab>('breed');
  return (
    <section className="lab view-enter" aria-labelledby="lab-title">
      <div className="panel__head">
        <div className="panel__title">
          <span className="panel__title-icon" aria-hidden>🔬</span>
          <div>
            <h2 id="lab-title">Gene Lab</h2>
            <div className="panel__sub">Splice crops, add catalysts, discover new life.</div>
          </div>
        </div>
        <div className="tabs" role="tablist">
          {([
            ['breed', '🧬 Breed'],
            ['extract', '🧪 Extract'],
            ['upgrades', '⚙️ Upgrades'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} id={`lab-tab-${id}`} role="tab" className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'breed' && <BreedTab />}
      {tab === 'extract' && <ExtractTab />}
      {tab === 'upgrades' && <UpgradesTab />}
    </section>
  );
}
