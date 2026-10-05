'use client';

import { useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';

import { useGame } from '@/stores/gameStore';
import { ALL_PLANTS, FAMILY_LABEL, PLANTS, TOTAL_SPECIES, type Family, type PlantStats } from '@/data/plants';
import { GENES, RARITY_INFO, RARITY_ORDER, type Rarity } from '@/data/genes';
import { SOILS, WEATHERS } from '@/data/world';
import type { ParentSelector } from '@/data/recipes';
import { originsOf } from '@/lib/breeding';
import PlantIcon from '@/components/ui/PlantIcon';
import { Modal } from '@/components/ui/Overlays';

const STAT_META: { key: keyof PlantStats; icon: string; label: string }[] = [
  { key: 'growth', icon: '🌱', label: 'Sinh trưởng' },
  { key: 'sweetness', icon: '🍯', label: 'Độ ngọt' },
  { key: 'size', icon: '📏', label: 'Kích thước' },
  { key: 'resistance', icon: '🛡️', label: 'Sức đề kháng' },
];

function selectorName(sel: ParentSelector, discovered: string[]) {
  if (sel === '*') return 'bất kỳ nông sản';
  if (sel.startsWith('family:')) {
    const fam = sel.slice(7) as Family;
    return `bất kỳ loại ${FAMILY_LABEL[fam] ?? fam}`;
  }
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
          <span className="chip">⏱️ {p.days} ngày</span>
          <span className="chip">🪙 {p.cropPrice}</span>
          {p.gene && <span className="chip">{GENES[p.gene].icon} {GENES[p.gene].name}</span>}
        </div>
      </div>

      <div className="detail-section">
        <h4>Gene gốc</h4>
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
            🏅 Cá thể tốt nhất từng lai: {best.growth}/{best.sweetness}/{best.size}/{best.resistance}
          </p>
        )}
      </div>

      <div className="detail-section">
        <h4>Cách có được</h4>
        {isStarter && <div className="recipe-line">🛒 Mua hạt giống ở Cửa hàng</div>}
        {breed.map((r, i) => (
          <div key={`b${i}`} className="recipe-line">
            🧬 {selectorName(r.a, discovered)} + {selectorName(r.b, discovered)}
            {(r.weather || r.catalyst) && (
              <span className="muted">
                {' '}khi trời {r.weather ? `${WEATHERS[r.weather].icon} ${WEATHERS[r.weather].name}` : '—'}
                {r.catalyst && ` hoặc dùng ${GENES[r.catalyst].icon} ${GENES[r.catalyst].name}`}
              </span>
            )}
          </div>
        ))}
        {farm.map((m, i) => (
          <div key={`f${i}`} className="recipe-line">
            🧺 Thu hoạch {selectorName(m.from, discovered)}{' '}
            <span className="muted">
              {m.weather ? `khi trời ${WEATHERS[m.weather].icon} ${WEATHERS[m.weather].name}` : `trên ${SOILS[m.soil!].icon} ${SOILS[m.soil!].name}`}
            </span>
          </div>
        ))}
        {!isStarter && scanner < 2 && <p className="muted mt-2" style={{ fontSize: 12, fontWeight: 700 }}>Nâng cấp Máy quét Gene để xem công thức của các loài chưa khám phá.</p>}
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
    if (m) return <>🔍 Thu hoạch {selectorName(m.from, discovered)} {m.weather ? WEATHERS[m.weather].icon : SOILS[m.soil!].icon}</>;
  }
  // Scanner Lv1 — reveal the condition only
  const conds = [
    ...breed.flatMap((x) => [x.weather && WEATHERS[x.weather].icon, x.catalyst && GENES[x.catalyst].icon]),
    ...farm.flatMap((x) => [x.weather && WEATHERS[x.weather].icon, x.soil && SOILS[x.soil].icon]),
  ].filter(Boolean);
  return <>&ldquo;{p.hint}&rdquo; {conds.length > 0 && <b>🔍 {Array.from(new Set(conds)).join(' ')}</b>}</>;
}

import { ALL_CREATURES, ELEMENT_INFO } from '@/data/creatures';

export default function GeneDexView() {
  const discovered = useGame((s) => s.discovered);
  const discoveredCreatures = useGame((s) => s.discoveredCreatures);
  const gp = useGame((s) => s.gp);
  const [dexMode, setDexMode] = useState<'plants' | 'creatures'>('plants');
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
            <div className="panel__sub">Bộ sưu tập tất cả các loài cây và sinh vật bạn đã khám phá.</div>
          </div>
        </div>
        <span className="stat stat--gp"><span className="stat__icon">🧬</span>{gp} GP</span>
      </div>

      {/* Mode Switcher */}
      <div className="tabs my-3 border-b border-amber-900/10 pb-2">
        <button
          className={`tab ${dexMode === 'plants' ? 'tab--active' : ''}`}
          onClick={() => setDexMode('plants')}
        >
          🌱 PlantDex ({discovered.length}/{TOTAL_SPECIES})
        </button>
        <button
          className={`tab ${dexMode === 'creatures' ? 'tab--active' : ''}`}
          onClick={() => setDexMode('creatures')}
        >
          🐲 CreatureDex ({discoveredCreatures.length}/{ALL_CREATURES.length})
        </button>
      </div>

      {dexMode === 'plants' ? (
        <>
          <div className="dex-head">
            <div className="dex-progress">
              <span className="dex-count">{found} / {TOTAL_SPECIES}</span>
              <div className="bar" aria-label={`Hoàn thành ${pct}%`}>
                <div className="bar__fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="chip">{pct}%</span>
            </div>
            <div className="tabs" role="tablist" aria-label="Lọc theo độ hiếm">
              <button role="tab" id="dex-filter-all" className="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</button>
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
                <motion.button
                  key={p.id}
                  id={`dex-${p.id}`}
                  className={`dex-card dex-card--found ${recent.includes(p.id) && found > 5 ? 'dex-card--new' : ''}`}
                  style={{ '--rc': rc } as CSSProperties}
                  onClick={() => setOpen(p.id)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="dex-card__no">#{String(p.dex).padStart(3, '0')}</span>
                  <span className="dex-card__rarity rarity" style={{ '--rc': rc } as CSSProperties}>{RARITY_INFO[p.rarity].label}</span>
                  <PlantIcon id={p.id} size={62} />
                  <div className="card__name">{p.name}</div>
                  <div className="card__meta">🪙 {p.cropPrice} · ⏱️ {p.days} ngày</div>
                </motion.button>
              );
            })}
          </div>
        </>
      ) : (
        /* CreatureDex View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ALL_CREATURES.map((c) => {
            const isDiscovered = discoveredCreatures.includes(c.id);
            const ele = ELEMENT_INFO[c.element];
            const rc = RARITY_INFO[c.rarity].color;

            if (!isDiscovered) {
              return (
                <div key={c.id} className="card p-4 rounded-2xl border-2 border-dashed border-amber-900/20 bg-amber-950/5 text-center">
                  <span className="text-xs font-bold text-amber-900/40">#{String(c.dex).padStart(3, '0')}</span>
                  <div className="text-5xl opacity-20 filter grayscale my-2" aria-hidden>{c.icon}</div>
                  <div className="font-extrabold text-amber-950/40">???</div>
                  <div className="text-xs font-bold text-amber-900/50 mt-1">&ldquo;Chưa được phát hiện&rdquo;</div>
                </div>
              );
            }

            return (
              <motion.div
                key={c.id}
                className="card p-4 rounded-2xl border-2 border-amber-900/20 bg-white/90 shadow-sm flex flex-col justify-between"
                whileHover={{ scale: 1.03 }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900/60">#{String(c.dex).padStart(3, '0')}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: ele.color }}>
                      {ele.icon} {ele.name}
                    </span>
                  </div>
                  <div className="text-center my-2">
                    <span className="text-5xl" aria-hidden>{c.icon}</span>
                    <h3 className="text-base font-extrabold text-amber-950 mt-1">{c.name} ({c.title})</h3>
                  </div>
                  <p className="text-xs text-amber-900/70 font-semibold mb-3">{c.description}</p>
                </div>

                <div className="pt-2 border-t border-amber-900/10 text-[11px] font-extrabold text-amber-950 flex items-center justify-between">
                  <span>HP: {c.baseStats.hp} · ATK: {c.baseStats.atk}</span>
                  <span style={{ color: rc }}>{RARITY_INFO[c.rarity].label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {open && <Detail id={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
