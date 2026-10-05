'use client';

import { useState, type CSSProperties } from 'react';
import { useGame } from '@/stores/gameStore';
import { ALL_PLANTS, PLANTS, TOTAL_SPECIES, type PlantStats } from '@/data/plants';
import { GENES, RARITY_INFO, RARITY_ORDER, type Rarity } from '@/data/genes';
import { SOILS, WEATHERS } from '@/data/world';
import type { ParentSelector } from '@/data/recipes';
import { originsOf } from '@/lib/breeding';
import PlantIcon from '@/components/ui/PlantIcon';
import { Modal } from '@/components/ui/Overlays';

const STAT_META: { key: keyof PlantStats; icon: string; label: string }[] = [
  { key: 'growth', icon: '🌱', label: 'Growth' },
  { key: 'sweetness', icon: '🍯', label: 'Sweetness' },
  { key: 'size', icon: '📏', label: 'Size' },
  { key: 'resistance', icon: '🛡️', label: 'Resistance' },
];

function selectorName(sel: ParentSelector, discovered: string[]) {
  if (sel === '*') return 'any crop';
  if (sel.startsWith('family:')) return `any ${sel.slice(7)}`;
  return discovered.includes(sel) ? PLANTS[sel].name : '???';
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const discovered = useGame((s) => s.discovered);
  const scanner = useGame((s) => s.lab.scanner);
  const best = useGame((s) => s.best[id]);
  const p = PLANTS[id];
  const rarity = RARITY_INFO[p.rarity];
  const { breed, farm } = originsOf(id);
  const isStarter = p.seedPrice !== undefined;

  return (
    <Modal onClose={onClose} labelledBy="dex-detail-title">
      <div className="detail-hero">
        <span className="chip">#{String(p.dex).padStart(3, '0')}</span>
        <PlantIcon id={id} size={110} float />
        <span className="rarity" style={{ '--rc': rarity.color } as CSSProperties}>{rarity.label}</span>
        <h2 id="dex-detail-title" style={{ fontSize: 28 }}>{p.name}</h2>
        <p className="muted" style={{ fontWeight: 700, maxWidth: 380 }}>{p.description}</p>
        <div className="row row--wrap" style={{ justifyContent: 'center' }}>
          <span className="chip">🎨 {p.colorGene}</span>
          <span className="chip">⏱️ {p.days} days</span>
          <span className="chip">🪙 {p.cropPrice}</span>
          {p.gene && <span className="chip">{GENES[p.gene].icon} {GENES[p.gene].name}</span>}
        </div>
      </div>

      <div className="detail-section">
        <h4>Base genes</h4>
        <div className="detail-stats">
          {STAT_META.map((m) => (
            <div key={m.key} className="statline" title={m.label}>
              <span aria-hidden>{m.icon}</span>
              <div className="bar"><div className="bar__fill" style={{ width: `${p.stats[m.key]}%` }} /></div>
              <span className="statline__val">{p.stats[m.key]}</span>
            </div>
          ))}
        </div>
        {best && (
          <p className="muted mt-2" style={{ fontSize: 13, fontWeight: 700 }}>
            🏅 Best specimen bred: {best.growth}/{best.sweetness}/{best.size}/{best.resistance}
          </p>
        )}
      </div>

      <div className="detail-section">
        <h4>How to obtain</h4>
        {isStarter && <div className="recipe-line">🛒 Buy seeds in the Shop</div>}
        {breed.map((r, i) => (
          <div key={`b${i}`} className="recipe-line">
            🧬 {selectorName(r.a, discovered)} + {selectorName(r.b, discovered)}
            {(r.weather || r.catalyst) && (
              <span className="muted">
                {' '}during {r.weather ? `${WEATHERS[r.weather].icon} ${WEATHERS[r.weather].name}` : '—'}
                {r.catalyst && ` or with ${GENES[r.catalyst].icon} ${GENES[r.catalyst].name}`}
              </span>
            )}
          </div>
        ))}
        {farm.map((m, i) => (
          <div key={`f${i}`} className="recipe-line">
            🧺 Harvest {selectorName(m.from, discovered)}{' '}
            <span className="muted">
              {m.weather ? `during ${WEATHERS[m.weather].icon} ${WEATHERS[m.weather].name}` : `on ${SOILS[m.soil!].icon} ${SOILS[m.soil!].name}`}
            </span>
          </div>
        ))}
        {!isStarter && scanner < 2 && <p className="muted mt-2" style={{ fontSize: 12, fontWeight: 700 }}>Upgrade the Gene Scanner to reveal recipes for undiscovered species.</p>}
      </div>
    </Modal>
  );
}

function LockedHint({ id }: { id: string }) {
  const scanner = useGame((s) => s.lab.scanner);
  const discovered = useGame((s) => s.discovered);
  const p = PLANTS[id];
  if (scanner === 0) return <>&ldquo;{p.hint}&rdquo;</>;
  const { breed, farm } = originsOf(id);
  const r = breed[0];
  const m = farm[0];
  if (scanner >= 2) {
    if (r) {
      const cond = r.weather ? ` · ${WEATHERS[r.weather].icon}` : '';
      const cat = r.catalyst ? ` · ${GENES[r.catalyst].icon}` : '';
      return <>🔍 {selectorName(r.a, discovered)} + {selectorName(r.b, discovered)}{cond}{cat}</>;
    }
    if (m) return <>🔍 Harvest {selectorName(m.from, discovered)} {m.weather ? WEATHERS[m.weather].icon : SOILS[m.soil!].icon}</>;
  }
  // Scanner Lv1 — reveal the condition only
  const conds = [
    ...breed.flatMap((x) => [x.weather && WEATHERS[x.weather].icon, x.catalyst && GENES[x.catalyst].icon]),
    ...farm.flatMap((x) => [x.weather && WEATHERS[x.weather].icon, x.soil && SOILS[x.soil].icon]),
  ].filter(Boolean);
  return <>&ldquo;{p.hint}&rdquo; {conds.length > 0 && <b>🔍 {Array.from(new Set(conds)).join(' ')}</b>}</>;
}

export default function GeneDexView() {
  const discovered = useGame((s) => s.discovered);
  const gp = useGame((s) => s.gp);
  const [filter, setFilter] = useState<'all' | Rarity>('all');
  const [open, setOpen] = useState<string | null>(null);

  const found = discovered.length;
  const pct = Math.round((found / TOTAL_SPECIES) * 100);
  const recent = discovered.slice(-3);
  const list = ALL_PLANTS.filter((p) => filter === 'all' || p.rarity === filter);

  return (
    <section className="panel view-enter" aria-labelledby="dex-title">
      <div className="panel__head">
        <div className="panel__title">
          <span className="panel__title-icon" aria-hidden>📖</span>
          <div>
            <h2 id="dex-title">GeneDex</h2>
            <div className="panel__sub">Every species you have brought to life.</div>
          </div>
        </div>
        <span className="stat stat--gp"><span className="stat__icon">🧬</span>{gp} GP</span>
      </div>

      <div className="dex-head">
        <div className="dex-progress">
          <span className="dex-count">{found} / {TOTAL_SPECIES}</span>
          <div className="bar" aria-label={`${pct}% complete`}>
            <div className="bar__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="chip">{pct}%</span>
        </div>
        <div className="tabs" role="tablist" aria-label="Filter by rarity">
          <button role="tab" id="dex-filter-all" className="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>All</button>
          {RARITY_ORDER.map((r) => {
            const total = ALL_PLANTS.filter((p) => p.rarity === r).length;
            const got = ALL_PLANTS.filter((p) => p.rarity === r && discovered.includes(p.id)).length;
            return (
              <button key={r} role="tab" id={`dex-filter-${r}`} className="tab" aria-selected={filter === r} onClick={() => setFilter(r)}>
                <span style={{ width: 9, height: 9, borderRadius: 9, background: RARITY_INFO[r].color, display: 'inline-block' }} />
                {RARITY_INFO[r].label}
                <span className="tab__count">{got}/{total}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dex-grid">
        {list.map((p) => {
          const isFound = discovered.includes(p.id);
          const rc = RARITY_INFO[p.rarity].color;
          if (!isFound) {
            return (
              <div key={p.id} className="dex-card dex-card--locked" style={{ '--rc': 'transparent' } as CSSProperties}>
                <span className="dex-card__no">#{String(p.dex).padStart(3, '0')}</span>
                <PlantIcon id={p.id} size={58} silhouette />
                <div className="card__name" style={{ color: 'var(--ink-faint)' }}>???</div>
                <div className="dex-card__hint"><LockedHint id={p.id} /></div>
              </div>
            );
          }
          return (
            <button
              key={p.id}
              id={`dex-${p.id}`}
              className={`dex-card dex-card--found ${recent.includes(p.id) && found > 5 ? 'dex-card--new' : ''}`}
              style={{ '--rc': rc } as CSSProperties}
              onClick={() => setOpen(p.id)}
            >
              <span className="dex-card__no">#{String(p.dex).padStart(3, '0')}</span>
              <span className="dex-card__rarity rarity" style={{ '--rc': rc } as CSSProperties}>{RARITY_INFO[p.rarity].label}</span>
              <PlantIcon id={p.id} size={62} />
              <div className="card__name">{p.name}</div>
              <div className="card__meta">🪙 {p.cropPrice} · ⏱️ {p.days}d</div>
            </button>
          );
        })}
      </div>

      {open && <Detail id={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
