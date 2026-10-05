'use client';

import { useGame, isReady, questContext, type View } from '@/stores/gameStore';
import { WEATHERS } from '@/data/world';
import { QUESTS } from '@/data/quests';

const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'farm', label: 'Farm', icon: '🌾' },
  { id: 'lab', label: 'Gene Lab', icon: '🧬' },
  { id: 'genedex', label: 'GeneDex', icon: '📖' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'inventory', label: 'Bag', icon: '🎒' },
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

  const w = WEATHERS[weather];
  const f = WEATHERS[forecast];

  const dots: Partial<Record<View, boolean>> = {
    farm: anyReady || claimable,
    lab: cropCount >= 2 && view !== 'lab',
  };

  return (
    <header className="hud">
      <div className="hud__bar">
        <div className="logo">
          <div className="logo__mark" aria-hidden>🌱</div>
          <div>
            <h1 className="logo__text">BLOOMCODE</h1>
            <div className="logo__tag">Gene Farm</div>
          </div>
        </div>

        <nav className="nav" aria-label="Game sections">
          {NAV.map((n) => (
            <button
              key={n.id}
              id={`nav-${n.id}`}
              className="nav__btn"
              aria-current={view === n.id ? 'page' : undefined}
              onClick={() => setView(n.id)}
            >
              <span className="nav__icon" aria-hidden>{n.icon}</span>
              <span>{n.label}</span>
              {dots[n.id] && view !== n.id && <span className="nav__dot" aria-label="Something needs attention" />}
            </button>
          ))}
        </nav>

        <div className="hud__right">
          <div className="stat stat--coin" title="Coins">
            <span className="stat__icon" aria-hidden>🪙</span>
            <span key={coin} className="stat--bump">{coin.toLocaleString()}</span>
          </div>
          <div className="stat stat--gp" title="Gene Points — earned by discovering species">
            <span className="stat__icon" aria-hidden>🧬</span>
            <span key={gp} className="stat--bump">{gp}</span>
          </div>
          <button id="mute-toggle" className="icon-btn" onClick={toggleMute} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="daybar">
        <div className="weather-pill">
          <span className="weather-pill__day">DAY {String(day).padStart(2, '0')}</span>
          <span className="weather-pill__now">
            <span className="weather-pill__icon" aria-hidden>{w.icon}</span>
            <span>
              {w.name}
              <span className="weather-pill__desc"> · {w.description}</span>
            </span>
          </span>
          <span className="weather-pill__forecast" title="Tomorrow's forecast">
            Tomorrow {f.icon} {f.name}
          </span>
        </div>
        <button id="sleep-button" className="btn btn--night sleep-btn" onClick={sleep}>
          <span className="zz" aria-hidden>🌙</span>
          <span className="label">Sleep · Next Day</span>
        </button>
      </div>
    </header>
  );
}
