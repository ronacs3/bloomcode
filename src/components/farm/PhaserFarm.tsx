'use client';

import { useEffect, useRef } from 'react';
import { useGame, isReady } from '@/stores/gameStore';
import { PLANTS } from '@/data/plants';
import { GRID_COLS } from '@/data/world';

export default function PhaserFarm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<{ destroy: (removeCanvas: boolean) => void } | null>(null);

  const applyTool = useGame((s) => s.applyTool);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    let destroyed = false;

    // Dynamically import Phaser on client side
    import('phaser').then((Phaser) => {
      if (destroyed || !containerRef.current) return;
      if (phaserRef.current) return;

      class FarmScene extends Phaser.Scene {
        private plotObjects: Map<number, Phaser.GameObjects.Container> = new Map();

        constructor() {
          super({ key: 'FarmScene' });
        }

        create() {
          this.cameras.main.setBackgroundColor('#86d164');

          // Create graphics texture for particles if not existing
          const graphics = this.make.graphics({ x: 0, y: 0 });
          graphics.fillStyle(0xffffff, 1);
          graphics.fillCircle(4, 4, 4);
          graphics.generateTexture('particle_dot', 8, 8);
          graphics.destroy();

          this.drawGrid();
        }

        drawGrid() {
          this.plotObjects.forEach((obj) => obj.destroy());
          this.plotObjects.clear();

          const cols = GRID_COLS;
          const tileSize = 76;
          const gap = 10;
          const startX = 50;
          const startY = 40;

          const currentPlots = useGame.getState().plots;

          currentPlots.forEach((p) => {
            const col = p.id % cols;
            const row = Math.floor(p.id / cols);
            const x = startX + col * (tileSize + gap);
            const y = startY + row * (tileSize + gap);

            const container = this.add.container(x, y);

            // Soil background tile
            const bg = this.add.rectangle(0, 0, tileSize, tileSize, p.unlocked ? (p.tilled ? 0x9a6640 : 0x62c14e) : 0x4a2c1a, 0.9);
            bg.setStrokeStyle(3, p.watered ? 0x2ec4b6 : 0x3b2a1f);
            bg.setInteractive({ useHandCursor: p.unlocked });
            bg.on('pointerdown', () => {
              applyTool(p.id);
              this.spawnFX(x, y, p.watered ? 0x4aa8ff : 0xffffa0);
            });

            container.add(bg);

            // Text / Label for status
            if (!p.unlocked) {
              const lockTxt = this.add.text(0, 0, '🔒', { fontSize: '24px' }).setOrigin(0.5);
              container.add(lockTxt);
            } else if (p.plantId) {
              const plant = PLANTS[p.plantId];
              const emoji = isReady(p) ? plant?.icon || '🌾' : '🌱';
              const txt = this.add.text(0, 0, emoji, { fontSize: isReady(p) ? '34px' : '26px' }).setOrigin(0.5);
              container.add(txt);
            }

            this.plotObjects.set(p.id, container);
          });
        }

        spawnFX(x: number, y: number, color: number) {
          const particles = this.add.particles(x, y, 'particle_dot', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 12,
            tint: color,
          });
          this.time.delayedCall(700, () => particles.destroy());
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 480,
        height: 380,
        transparent: true,
        scene: [FarmScene],
        physics: { default: 'arcade' },
      };

      const game = new Phaser.Game(config);
      phaserRef.current = game;
    });

    return () => {
      destroyed = true;
      if (phaserRef.current?.destroy) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [applyTool]);

  return (
    <div className="phaser-farm-wrapper my-2 flex flex-col items-center justify-center rounded-2xl bg-emerald-950/20 p-2 shadow-inner">
      <div className="mb-1 text-xs font-bold text-emerald-800 dark:text-emerald-200">
        ✨ Phaser 2D Interactive Canvas Engine
      </div>
      <div ref={containerRef} className="overflow-hidden rounded-xl shadow-md" style={{ width: 480, height: 380 }} />
    </div>
  );
}
