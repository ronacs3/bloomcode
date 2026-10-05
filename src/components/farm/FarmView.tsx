'use client';

import { useGame, questContext, isReady } from '@/stores/gameStore';
import { QUESTS, type QuestReward } from '@/data/quests';
import { PLANTS } from '@/data/plants';
import { SOILS, WEATHERS } from '@/data/world';
import { FARM_MUTATIONS } from '@/data/recipes';
import FarmGrid from './FarmGrid';
import Toolbar from './Toolbar';

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
    <section className="panel panel--ribbon" data-ribbon="Goals" aria-labelledby="goals-title">
      <div className="row row--between" style={{ marginBottom: 12, marginTop: 4 }}>
        <h2 id="goals-title" className="display" style={{ fontSize: 18 }}>Farm Journal</h2>
        <span className="chip">{doneCount}/{QUESTS.length}</span>
      </div>
      {active.length === 0 && <div className="tip"><span className="tip__icon">👑</span>All goals complete. You are a true Master Geneticist!</div>}
      {active.map((q) => {
        const prog = Math.min(q.target, q.progress(ctx));
        const done = prog >= q.target;
        return (
          <div key={q.id} className={`goal ${done ? 'goal--done' : ''}`}>
            <span className="goal__icon" aria-hidden>{q.icon}</span>
            <div className="goal__body">
              <div className="goal__title">{q.title}</div>
              <div className="goal__desc">{q.description}</div>
              {done ? (
                <div className="goal__reward">Reward: {rewardText(q.reward)}</div>
              ) : (
                <div className="bar" aria-label={`${prog} of ${q.target}`}>
                  <div className="bar__fill" style={{ width: `${(prog / q.target) * 100}%` }} />
                </div>
              )}
            </div>
            {done ? (
              <button id={`claim-${q.id}`} className="btn btn--gold btn--sm" onClick={() => state.claimQuest(q.id)}>Claim</button>
            ) : (
              <span className="chip">{prog}/{q.target}</span>
            )}
          </div>
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
    <section className="panel panel--ribbon" data-ribbon="Weather" aria-labelledby="weather-title">
      <h2 id="weather-title" className="sr-only">Weather and farm status</h2>
      <div className="mini-weather mt-2">
        <div className="mini-weather__cell">
          <small>Today</small>
          <div className="big" aria-hidden>{w.icon}</div>
          <b>{w.name}</b>
        </div>
        <div className="mini-weather__cell">
          <small>Tomorrow</small>
          <div className="big" aria-hidden>{f.icon}</div>
          <b>{f.name}</b>
        </div>
      </div>

      <div className="mt-4">
        {todayHints.length > 0 ? (
          <div className="tip">
            <span className="tip__icon">🧬</span>
            <span>
              <strong>Mutation window!</strong> Harvest{' '}
              {todayHints.map((h, i) => (
                <span key={h.from}>
                  {i > 0 && ', '}
                  <strong>{PLANTS[h.from].name}</strong> → {h.result ? PLANTS[h.result].name : '???'}
                </span>
              ))}{' '}
              today for a chance to mutate.
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
              <strong>Plan ahead:</strong> {f.name} tomorrow can mutate{' '}
              {tomorrowHints.map((h) => PLANTS[h.from].name).join(', ')}. Keep ripe crops in the ground!
            </span>
          </div>
        )}
        <div className="tip">
          <span className="tip__icon">🧑‍🌾</span>
          <span>
            <strong>{ready}</strong> ready to harvest · <strong>{thirsty}</strong> need water
            {sprinkler && ' · 💦 Sprinkler on'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function FarmView() {
  return (
    <div className="farm-layout view-enter">
      <div className="farm-stage">
        <h2 className="sr-only">My Farm</h2>
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
