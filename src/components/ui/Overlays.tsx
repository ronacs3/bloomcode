'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Sprout } from 'lucide-react';
import { useUi } from '@/stores/uiStore';
import { useGame } from '@/stores/gameStore';
import { PLANTS, TOTAL_SPECIES } from '@/data/plants';
import { CREATURES } from '@/data/creatures';
import { RARITY_INFO } from '@/data/genes';
import { WEATHERS } from '@/data/world';
import PlantIcon from './PlantIcon';

/* ---------------- Generic modal with Motion ---------------- */

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
    <AnimatePresence>
      <div className="backdrop" onClick={onClose}>
        <motion.div
          className={`modal ${variant === 'lab' ? 'modal--lab' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          <button className="icon-btn modal__close" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ---------------- Toasts with Motion ---------------- */

export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            className={`toast toast--${t.tone}`}
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className="toast__icon" aria-hidden>{t.icon}</span>
            {t.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Discovery celebration with canvas-confetti & Motion ---------------- */

export function DiscoveryModal() {
  const current = useUi((s) => s.discoveries[0]);
  const shift = useUi((s) => s.shiftDiscovery);
  const discovered = useGame((s) => s.discovered.length);
  const sfx = useGame((s) => s.sfx);

  useEffect(() => {
    if (current) {
      sfx('discover');
      // Trigger canvas-confetti burst!
      void confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5d73', '#ffc53d', '#62c14e', '#4aa8ff', '#9b6bff', '#2ec4b6'],
      });
    }
  }, [current, sfx]);

  if (!current) return null;
  const plant = PLANTS[current];
  const creature = CREATURES[current];

  if (!plant && !creature) return null;

  const name = plant?.name || creature?.name || 'Vật Thể Bí Ẩn';
  const rarityKey = plant?.rarity || creature?.rarity || 'common';
  const rarity = RARITY_INFO[rarityKey];
  const description = plant?.description || creature?.description || '';
  const dexNo = plant?.dex ? `GeneDex #${String(plant.dex).padStart(3, '0')} · ${discovered}/${TOTAL_SPECIES}` : `Sinh Vật mới`;

  return (
    <AnimatePresence>
      <div
        className="discovery"
        style={{ '--rc': rarity.color } as CSSProperties}
        onClick={shift}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-name"
      >
        <div className="discovery__rays" aria-hidden />
        <motion.div
          className="discovery__card"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.6, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <span className="discovery__kicker flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-400" /> Khám Phá Mới <Sparkles className="w-4 h-4 text-amber-400" />
          </span>
          {plant ? (
            <PlantIcon id={current} size={130} float />
          ) : (
            <div className="text-8xl my-4 animate-bounce" aria-hidden>
              {creature?.icon}
            </div>
          )}
          <span className="rarity" style={{ '--rc': rarity.color } as CSSProperties}>{rarity.label}</span>
          <h2 id="discovery-name" className="discovery__name">{name}</h2>
          <span className="discovery__no">{dexNo}</span>
          <p className="muted" style={{ fontWeight: 700 }}>{description}</p>
          <span className="discovery__reward">+{rarity.gp} 🧬 Điểm Gene</span>
          <motion.button
            id="discovery-continue"
            className="btn btn--gold btn--lg btn--block mt-2"
            onClick={shift}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Tuyệt vời!
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ---------------- Day transition with Motion ---------------- */

export function DayCard() {
  const card = useUi((s) => s.dayCard);
  if (!card) return null;
  const w = WEATHERS[card.weather];
  return (
    <AnimatePresence>
      <motion.div
        key={card.key}
        className="daycard"
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="daycard__inner">
          <span className="daycard__icon">{w.icon}</span>
          <span className="daycard__day">Ngày {card.day}</span>
          <span className="daycard__weather">{w.name} — {w.description}</span>
        </div>
      </motion.div>
    </AnimatePresence>
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
        <h2 id="intro-title" style={{ fontSize: 30 }}>Chào mừng đến BLOOMCODE</h2>
        <p className="muted mt-2" style={{ fontWeight: 700 }}>
          Một nông trại ấm cúng nơi mỗi vụ mùa đều mang gene. Hãy lai ghép chúng để tạo ra những loài chưa ai từng thấy.
        </p>
        <div className="intro__steps">
          <div className="intro__step"><b>⛏️</b>Xới đất, gieo hạt và tưới nước. Đi ngủ để cây lớn.</div>
          <div className="intro__step"><b>⛈️</b>Thời tiết và loại đất có thể làm cây đột biến khi thu hoạch — nhớ xem dự báo ngày mai!</div>
          <div className="intro__step"><b>🧬</b>Lai hai nông sản trong Phòng Gene. Thêm gene xúc tác để ra loài hiếm.</div>
          <div className="intro__step"><b>📖</b>Điền đủ 30 loài vào GeneDex để trở thành Bậc Thầy Di Truyền.</div>
        </div>
        <motion.button
          id="intro-start"
          className="btn btn--lg btn--block flex items-center justify-center gap-2"
          onClick={dismiss}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sprout className="w-5 h-5 text-emerald-300" /> Bắt đầu làm vườn 🌱
        </motion.button>
      </div>
    </Modal>
  );
}
