'use client';

import { useEffect, useRef } from 'react';
import { useGame, isReady, type Plot } from '@/stores/gameStore';
import { useUi } from '@/stores/uiStore';
import { PLANTS } from '@/data/plants';
import { SOILS, GRID_COLS, plotUnlockCost } from '@/data/world';
import PlantIcon, { stageFor } from '@/components/ui/PlantIcon';

function describe(p: Plot, cost: number) {
  if (!p.unlocked) return `Ô đất bị khoá — mở với giá ${cost} xu`;
  if (!p.plantId) return p.tilled ? `${SOILS[p.soil].name} đã xới, sẵn sàng gieo hạt` : 'Bãi cỏ chưa xới';
  const name = PLANTS[p.plantId].name;
  if (isReady(p)) return `${name} đã chín, có thể thu hoạch`;
  return `${name}, lớn ${Math.round(p.growth)}%, ${p.watered ? 'đã tưới' : 'cần tưới nước'}`;
}

export default function FarmGrid() {
  const plots = useGame((s) => s.plots);
  const tool = useGame((s) => s.tool);
  const weather = useGame((s) => s.weather);
  const applyTool = useGame((s) => s.applyTool);
  const plotFx = useUi((s) => s.plotFx);
  const painting = useRef(false);

  const cost = plotUnlockCost(plots.filter((p) => p.unlocked).length);

  useEffect(() => {
    const stop = () => {
      painting.current = false;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  return (
    <div className="field" data-tool={tool} data-weather={weather}>
      <div className="field__grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }} onDragStart={(e) => e.preventDefault()}>
        {plots.map((p) => {
          const ready = isReady(p);
          const stage = p.plantId ? stageFor(p.growth) : null;
          const fx = plotFx[p.id];
          const classes = [
            'plot',
            !p.unlocked && 'plot--locked',
            p.unlocked && (p.tilled || p.plantId) && 'plot--tilled',
            p.watered && p.plantId && !ready && 'plot--watered',
            ready && 'plot--ready',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={p.id}
              id={`plot-${p.id}`}
              className={classes}
              data-soil={p.soil}
              aria-label={describe(p, cost)}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                painting.current = p.unlocked;
                applyTool(p.id);
              }}
              onPointerEnter={() => {
                if (painting.current) applyTool(p.id, true);
              }}
              onClick={(e) => {
                // Keyboard activation (pointer clicks are handled on pointerdown)
                if (e.detail === 0) applyTool(p.id);
              }}
            >
              {!p.unlocked ? (
                <span className="plot__lock">
                  <span aria-hidden>🔒</span>
                  <span className="plot__price">🪙 {cost}</span>
                </span>
              ) : (
                <>
                  {p.soil !== 'normal' && <span className="plot__soil-tag" aria-hidden>{SOILS[p.soil].icon}</span>}
                  {p.plantId && stage && (
                    <span key={`${p.plantId}-${stage}`} className="plot__plant plot__plant--pop">
                      <PlantIcon id={p.plantId} stage={stage} size={52} />
                    </span>
                  )}
                  {p.plantId && !ready && (
                    <>
                      <span className={`plot__status ${p.watered ? '' : 'plot__status--thirsty'}`} aria-hidden>
                        {p.watered ? '💧' : '🫗'}
                      </span>
                      <span className="plot__progress" aria-hidden>
                        <span style={{ width: `${Math.max(6, p.growth)}%` }} />
                      </span>
                    </>
                  )}
                  {ready && (
                    <>
                      <span className="plot__ready-tag">Chín rồi!</span>
                      <span className="plot__sparkle" aria-hidden />
                    </>
                  )}
                </>
              )}
              {fx && (
                <span key={fx.key} className="plot__fx" aria-hidden>
                  {fx.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
