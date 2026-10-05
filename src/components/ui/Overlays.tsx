'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { useUi } from '@/stores/uiStore';
import { useGame } from '@/stores/gameStore';
import { PLANTS, TOTAL_SPECIES } from '@/data/plants';
import { RARITY_INFO } from '@/data/genes';
import { WEATHERS } from '@/data/world';
import PlantIcon from './PlantIcon';

/* ---------------- Generic modal ---------------- */

export function Modal({
  onClose,
  children,
  variant,
  labelledBy,
}: {
  onClose: () => void;
  children: ReactNode;
  variant?: 'lab';
  labelledBy?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className={`modal ${variant === 'lab' ? 'modal--lab' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-btn modal__close" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */

export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className={`toast toast--${t.tone}`} onClick={() => dismiss(t.id)}>
          <span className="toast__icon" aria-hidden>{t.icon}</span>
          {t.text}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Discovery celebration ---------------- */

const CONFETTI_COLORS = ['#ff5d73', '#ffc53d', '#62c14e', '#4aa8ff', '#9b6bff', '#2ec4b6'];
const CONFETTI = Array.from({ length: 36 }, (_, i) => i);
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 91.17 + s * 47.3) * 10000;
  return x - Math.floor(x);
};

export function DiscoveryModal() {
  const current = useUi((s) => s.discoveries[0]);
  const shift = useUi((s) => s.shiftDiscovery);
  const discovered = useGame((s) => s.discovered.length);
  const sfx = useGame((s) => s.sfx);

  useEffect(() => {
    if (current) sfx('discover');
  }, [current, sfx]);

  if (!current) return null;
  const plant = PLANTS[current];
  const rarity = RARITY_INFO[plant.rarity];

  return (
    <div className="discovery" style={{ '--rc': rarity.color } as CSSProperties} onClick={shift} role="dialog" aria-modal="true" aria-labelledby="discovery-name">
      <div className="discovery__rays" aria-hidden />
      {CONFETTI.map((i) => (
        <span
          key={`${current}-${i}`}
          className="confetti"
          aria-hidden
          style={{
            left: `${rnd(i, 1) * 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDuration: `${2.2 + rnd(i, 2) * 2}s`,
            animationDelay: `${rnd(i, 3) * 0.6}s`,
            transform: `rotate(${rnd(i, 4) * 360}deg)`,
          }}
        />
      ))}
      <div className="discovery__card" onClick={(e) => e.stopPropagation()}>
        <span className="discovery__kicker">✨ New Species Discovered ✨</span>
        <PlantIcon id={current} size={130} float />
        <span className="rarity" style={{ '--rc': rarity.color } as CSSProperties}>{rarity.label}</span>
        <h2 id="discovery-name" className="discovery__name">{plant.name}</h2>
        <span className="discovery__no">GeneDex #{String(plant.dex).padStart(3, '0')} · {discovered}/{TOTAL_SPECIES}</span>
        <p className="muted" style={{ fontWeight: 700 }}>{plant.description}</p>
        <span className="discovery__reward">+{rarity.gp} 🧬 Gene Points</span>
        <button id="discovery-continue" className="btn btn--gold btn--lg btn--block mt-2" onClick={shift}>
          Amazing!
        </button>
      </div>
    </div>
  );
}

/* ---------------- Day transition ---------------- */

export function DayCard() {
  const card = useUi((s) => s.dayCard);
  if (!card) return null;
  const w = WEATHERS[card.weather];
  return (
    <div key={card.key} className="daycard" aria-hidden>
      <div className="daycard__inner">
        <span className="daycard__icon">{w.icon}</span>
        <span className="daycard__day">Day {card.day}</span>
        <span className="daycard__weather">{w.name} — {w.description}</span>
      </div>
    </div>
  );
}

/* ---------------- Intro / how to play ---------------- */

export function IntroModal() {
  const seen = useGame((s) => s.seenIntro);
  const dismiss = useGame((s) => s.dismissIntro);
  if (seen) return null;
  return (
    <Modal onClose={dismiss} labelledBy="intro-title">
      <div className="intro">
        <div className="intro__hero" aria-hidden>
          <span>🍓</span><span>🧬</span><span>🌻</span>
        </div>
        <h2 id="intro-title" style={{ fontSize: 30 }}>Welcome to BLOOMCODE</h2>
        <p className="muted mt-2" style={{ fontWeight: 700 }}>
          A cozy farm where every harvest carries genes. Splice them to create species nobody has seen before.
        </p>
        <div className="intro__steps">
          <div className="intro__step"><b>⛏️</b>Till soil, plant seeds and water them. Sleep to grow.</div>
          <div className="intro__step"><b>⛈️</b>Weather & soil can mutate crops at harvest — check tomorrow&apos;s forecast!</div>
          <div className="intro__step"><b>🧬</b>Breed two crops in the Gene Lab. Add gene catalysts for rare results.</div>
          <div className="intro__step"><b>📖</b>Fill all 30 GeneDex entries to become a Master Geneticist.</div>
        </div>
        <button id="intro-start" className="btn btn--lg btn--block" onClick={dismiss}>Start Farming 🌱</button>
      </div>
    </Modal>
  );
}
