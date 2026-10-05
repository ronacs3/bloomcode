'use client';

import { useEffect } from 'react';
import { useGame, type Tool } from '@/stores/gameStore';
import { PLANTS } from '@/data/plants';
import { SOILS, SOIL_KIT_IDS, type SoilId } from '@/data/world';
import PlantIcon from '@/components/ui/PlantIcon';

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'hoe', label: 'Hoe', icon: '⛏️' },
  { id: 'water', label: 'Water', icon: '🚿' },
  { id: 'harvest', label: 'Harvest', icon: '🧺' },
];

export default function Toolbar() {
  const tool = useGame((s) => s.tool);
  const selectedSeed = useGame((s) => s.selectedSeed);
  const selectedSoil = useGame((s) => s.selectedSoil);
  const seeds = useGame((s) => s.seeds);
  const soils = useGame((s) => s.soils);
  const setTool = useGame((s) => s.setTool);

  const seedList = Object.entries(seeds)
    .filter(([, q]) => (q ?? 0) > 0)
    .sort(([a], [b]) => PLANTS[a].dex - PLANTS[b].dex);
  const soilList = SOIL_KIT_IDS.filter((id) => (soils[id] ?? 0) > 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (n <= 3) setTool(TOOLS[n - 1].id);
      else {
        const entry = seedList[n - 4];
        if (entry) setTool('seed', entry[0]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [seedList, setTool]);

  return (
    <div className="hotbar" role="toolbar" aria-label="Farming tools">
      <div className="hotbar__group">
        {TOOLS.map((t, i) => (
          <button
            key={t.id}
            id={`tool-${t.id}`}
            className="slot"
            aria-pressed={tool === t.id}
            onClick={() => setTool(t.id)}
            title={`${t.label} (${i + 1})`}
          >
            <span className="slot__key">{i + 1}</span>
            <span className="slot__icon" aria-hidden>{t.icon}</span>
            <span className="slot__label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="hotbar__sep" />
      <span className="hotbar__label">Seeds</span>

      <div className="hotbar__group">
        {seedList.length === 0 && (
          <div className="slot" style={{ width: 150, cursor: 'default' }}>
            <span className="slot__icon" aria-hidden>🛒</span>
            <span className="slot__label">No seeds — visit the Shop</span>
          </div>
        )}
        {seedList.map(([id, q], i) => (
          <button
            key={id}
            id={`seed-${id}`}
            className="slot"
            aria-pressed={tool === 'seed' && selectedSeed === id}
            onClick={() => setTool('seed', id)}
            title={`${PLANTS[id].name} seed${i < 6 ? ` (${i + 4})` : ''}`}
          >
            {i < 6 && <span className="slot__key">{i + 4}</span>}
            <span className="slot__icon"><PlantIcon id={id} size={30} /></span>
            <span className="slot__label">{PLANTS[id].name}</span>
            <span className="slot__count">{q}</span>
          </button>
        ))}
      </div>

      {soilList.length > 0 && (
        <>
          <div className="hotbar__sep" />
          <span className="hotbar__label">Soil</span>
          <div className="hotbar__group">
            {soilList.map((id: SoilId) => (
              <button
                key={id}
                id={`soil-${id}`}
                className="slot"
                aria-pressed={tool === 'soil' && selectedSoil === id}
                onClick={() => setTool('soil', id)}
                title={`${SOILS[id].name}: ${SOILS[id].description}`}
              >
                <span className="slot__icon" aria-hidden>{SOILS[id].icon}</span>
                <span className="slot__label">{SOILS[id].name.replace(' Soil', '')}</span>
                <span className="slot__count">{soils[id]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
