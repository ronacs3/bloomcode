'use client';

import { useGame, isReady, questContext, type View } from '@/stores/gameStore';
import { WEATHERS } from '@/data/world';
import { QUESTS } from '@/data/quests';
import { motion } from 'motion/react';
import {
  Sprout,
  Dna,
  BookOpen,
  ShoppingBag,
  Backpack,
  Coins,
  Volume2,
  VolumeX,
  Moon,
  Sparkles,
  PawPrint,
  Swords,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'farm', label: 'Nông trại', icon: <Sprout className="w-4 h-4 inline-block" /> },
  { id: 'ranch', label: 'Trại thú', icon: <PawPrint className="w-4 h-4 inline-block" /> },
  { id: 'lab', label: 'Phòng Gene', icon: <Dna className="w-4 h-4 inline-block" /> },
  { id: 'battle', label: 'Đấu trường', icon: <Swords className="w-4 h-4 inline-block" /> },
  { id: 'genedex', label: 'GeneDex', icon: <BookOpen className="w-4 h-4 inline-block" /> },
  { id: 'shop', label: 'Cửa hàng', icon: <ShoppingBag className="w-4 h-4 inline-block" /> },
  { id: 'inventory', label: 'Túi đồ', icon: <Backpack className="w-4 h-4 inline-block" /> },
];

export default function Header() {
  const day = useGame((s) => s.day);
  const weather = useGame((s) => s.weather);
  const forecast = useGame((s) => s.forecast);
  const coin = useGame((s) => s.coin);
  const gp = useGame((s) => s.gp);
  const view = useGame((s) => s.view);
  const muted = useGame((s) => s.muted);
  const setView = useGame((s) => s.setView);
  const sleep = useGame((s) => s.sleep);
  const toggleMute = useGame((s) => s.toggleMute);
  const anyReady = useGame((s) => s.plots.some(isReady));
  const claimable = useGame((s) => {
    const ctx = questContext(s);
    return QUESTS.some((q) => !s.claimed.includes(q.id) && q.progress(ctx) >= q.target);
  });
  const cropCount = useGame((s) => Object.values(s.crops).reduce<number>((a, b) => a + (b ?? 0), 0));
  const eggReady = useGame((s) => s.eggs.some((e) => e.daysRemaining <= 0));

  const w = WEATHERS[weather];
  const f = WEATHERS[forecast];

  const dots: Partial<Record<View, boolean>> = {
    farm: anyReady || claimable,
    ranch: eggReady && view !== 'ranch',
    lab: cropCount >= 2 && view !== 'lab',
  };

  return (
    <header className="hud">
      <div className="hud__bar">
        <div className="logo">
          <motion.div
            className="logo__mark"
            aria-hidden
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            🌱
          </motion.div>
          <div>
            <h1 className="logo__text">BLOOMCODE</h1>
            <div className="logo__tag">Nông trại Gene</div>
          </div>
        </div>

        <nav className="nav" aria-label="Khu vực trong game">
          {NAV.map((n) => (
            <motion.button
              key={n.id}
              id={`nav-${n.id}`}
              className="nav__btn"
              aria-current={view === n.id ? 'page' : undefined}
              onClick={() => setView(n.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="nav__icon mr-1 inline-flex items-center justify-center" aria-hidden>
                {n.icon}
              </span>
              <span>{n.label}</span>
              {dots[n.id] && view !== n.id && (
                <span className="nav__dot" aria-label="Có việc cần làm" />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="hud__right">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className="stat stat--coin flex items-center gap-1"
                key={coin}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="stat--bump">{coin.toLocaleString('vi-VN')}</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Số xu hiện có — dùng mua hạt &amp; nâng cấp</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className="stat stat--gp flex items-center gap-1"
                key={gp}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="stat--bump">{gp}</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Điểm Gene — nhận được khi khám phá loài mới</p>
            </TooltipContent>
          </Tooltip>

          <motion.button
            id="mute-toggle"
            className="icon-btn flex items-center justify-center p-2 rounded-full hover:bg-black/10"
            onClick={toggleMute}
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-rose-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="daybar">
        <div className="weather-pill flex items-center gap-2">
          <span className="weather-pill__day">NGÀY {String(day).padStart(2, '0')}</span>
          <span className="weather-pill__now flex items-center gap-1">
            <span className="weather-pill__icon" aria-hidden>{w.icon}</span>
            <span>
              {w.name}
              <span className="weather-pill__desc"> · {w.description}</span>
            </span>
          </span>
          <span className="weather-pill__forecast" title="Dự báo ngày mai">
            Ngày mai {f.icon} {f.name}
          </span>
        </div>

        <motion.button
          id="sleep-button"
          className="btn btn--night sleep-btn flex items-center gap-2"
          onClick={sleep}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Moon className="w-4 h-4 text-amber-300" />
          <span className="label">Đi ngủ · Sang ngày mới</span>
        </motion.button>
      </div>
    </header>
  );
}
