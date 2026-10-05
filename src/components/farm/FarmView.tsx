'use client';

import { useState } from 'react';
import { useGame, questContext, isReady } from '@/stores/gameStore';
import { QUESTS, type QuestReward } from '@/data/quests';
import { PLANTS } from '@/data/plants';
import { SOILS, WEATHERS } from '@/data/world';
import { FARM_MUTATIONS } from '@/data/recipes';
import { motion } from 'motion/react';
import { Sparkles, Trophy, CloudSun, Gamepad2, LayoutGrid } from 'lucide-react';
import FarmGrid from './FarmGrid';
import Toolbar from './Toolbar';
import PhaserFarm from './PhaserFarm';

function rewardText(r: QuestReward) {
  const parts: string[] = [];
  if (r.coin) parts.push(`🪙 ${r.coin}`);
  if (r.gp) parts.push(`🧬 ${r.gp}`);
  for (const [k, v] of Object.entries(r.seeds ?? {})) parts.push(`${PLANTS[k].icon}×${v}`);
  for (const [k, v] of Object.entries(r.soils ?? {})) parts.push(`${SOILS[k as keyof typeof SOILS].icon}×${v}`);
  return parts.join('  ');
}

function Goals() {
  const state = useGame();
  const ctx = questContext(state);
  const active = QUESTS.filter((q) => !state.claimed.includes(q.id)).slice(0, 3);
  const doneCount = state.claimed.length;

  return (
    <section className="panel panel--ribbon" data-ribbon="Mục tiêu" aria-labelledby="goals-title">
      <div className="row row--between" style={{ marginBottom: 12, marginTop: 4 }}>
        <h2 id="goals-title" className="display flex items-center gap-1.5" style={{ fontSize: 18 }}>
          <Trophy className="w-5 h-5 text-amber-500" /> Sổ Tay Nông Trại
        </h2>
        <span className="chip">{doneCount}/{QUESTS.length}</span>
      </div>
      {active.length === 0 && (
        <div className="tip">
          <span className="tip__icon">👑</span>Đã hoàn thành mọi mục tiêu. Bạn là Bậc Thầy Di Truyền thực thụ!
        </div>
      )}
      {active.map((q) => {
        const prog = Math.min(q.target, q.progress(ctx));
        const done = prog >= q.target;
        return (
          <motion.div
            key={q.id}
            className={`goal ${done ? 'goal--done' : ''}`}
            whileHover={{ scale: 1.01 }}
          >
            <span className="goal__icon" aria-hidden>{q.icon}</span>
            <div className="goal__body">
              <div className="goal__title">{q.title}</div>
              <div className="goal__desc">{q.description}</div>
              {done ? (
                <div className="goal__reward">Phần thưởng: {rewardText(q.reward)}</div>
              ) : (
                <div className="bar" aria-label={`${prog} trên ${q.target}`}>
                  <div className="bar__fill" style={{ width: `${(prog / q.target) * 100}%` }} />
                </div>
              )}
            </div>
            {done ? (
              <motion.button
                id={`claim-${q.id}`}
                className="btn btn--gold btn--sm"
                onClick={() => state.claimQuest(q.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Nhận
              </motion.button>
            ) : (
              <span className="chip">{prog}/{q.target}</span>
            )}
          </motion.div>
        );
      })}
    </section>
  );
}

function Forecast() {
  const weather = useGame((s) => s.weather);
  const forecast = useGame((s) => s.forecast);
  const discovered = useGame((s) => s.discovered);
  const plots = useGame((s) => s.plots);
  const sprinkler = useGame((s) => s.sprinkler);

  const w = WEATHERS[weather];
  const f = WEATHERS[forecast];
  const ready = plots.filter(isReady).length;
  const thirsty = plots.filter((p) => p.plantId && !p.watered && !isReady(p)).length;

  const mutationHints = (wid: typeof weather) =>
    FARM_MUTATIONS.filter((m) => m.weather === wid && !m.from.startsWith('family:')).map((m) => ({
      from: m.from,
      result: discovered.includes(m.result) ? m.result : null,
    }));

  const todayHints = mutationHints(weather);
  const tomorrowHints = mutationHints(forecast);

  return (
    <section className="panel panel--ribbon" data-ribbon="Thời tiết" aria-labelledby="weather-title">
      <h2 id="weather-title" className="sr-only">Thời tiết và tình trạng nông trại</h2>
      <div className="mini-weather mt-2">
        <div className="mini-weather__cell">
          <small className="flex items-center justify-center gap-1">
            <CloudSun className="w-3.5 h-3.5" /> Hôm nay
          </small>
          <div className="big" aria-hidden>{w.icon}</div>
          <b>{w.name}</b>
        </div>
        <div className="mini-weather__cell">
          <small>Ngày mai</small>
          <div className="big" aria-hidden>{f.icon}</div>
          <b>{f.name}</b>
        </div>
      </div>

      <div className="mt-4">
        {todayHints.length > 0 ? (
          <div className="tip">
            <span className="tip__icon"><Sparkles className="w-4 h-4 text-amber-500" /></span>
            <span>
              <strong>Cơ hội đột biến!</strong> Thu hoạch{' '}
              {todayHints.map((h, i) => (
                <span key={h.from}>
                  {i > 0 && ', '}
                  <strong>{PLANTS[h.from].name}</strong> → {h.result ? PLANTS[h.result].name : '???'}
                </span>
              ))}{' '}
              hôm nay để có cơ hội đột biến.
            </span>
          </div>
        ) : (
          <div className="tip">
            <span className="tip__icon">{w.icon}</span>
            <span>{w.description}</span>
          </div>
        )}
        {tomorrowHints.length > 0 && forecast !== weather && (
          <div className="tip">
            <span className="tip__icon">🔮</span>
            <span>
              <strong>Lên kế hoạch:</strong> Ngày mai {f.name.toLowerCase()} có thể làm đột biến{' '}
              {tomorrowHints.map((h) => PLANTS[h.from].name).join(', ')}. Hãy để cây chín trên ruộng chờ đến mai!
            </span>
          </div>
        )}
        <div className="tip">
          <span className="tip__icon">🧑‍🌾</span>
          <span>
            <strong>{ready}</strong> cây chín · <strong>{thirsty}</strong> cây cần tưới
            {sprinkler && ' · 💦 Vòi tưới đang bật'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function FarmView() {
  const [showPhaser, setShowPhaser] = useState(false);

  return (
    <div className="farm-layout view-enter">
      <div className="farm-stage flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <h2 className="sr-only">Nông trại của tôi</h2>
          <motion.button
            className="btn btn--sm btn--teal flex items-center gap-1.5 font-bold shadow-sm"
            onClick={() => setShowPhaser(!showPhaser)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPhaser ? (
              <>
                <LayoutGrid className="w-4 h-4" /> Bật Chế Độ Lưới HTML
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" /> Bật Phaser 2D Engine Canvas
              </>
            )}
          </motion.button>
        </div>

        {showPhaser && <PhaserFarm />}
        <FarmGrid />
        <Toolbar />
      </div>
      <aside className="sidebar">
        <Goals />
        <Forecast />
      </aside>
    </div>
  );
}
