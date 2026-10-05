'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Sparkles,
  Egg as EggIcon,
  ChefHat,
  ArrowUpCircle,
  Dna,
} from 'lucide-react';
import { useGame } from '@/stores/gameStore';
import { ALL_CREATURES, ELEMENT_INFO, GRADE_COLORS, type CreatureInstance } from '@/data/creatures';
import { CREATURE_FOODS } from '@/data/creatureRecipes';
import { PLANTS } from '@/data/plants';

export default function RanchView() {
  const creatures = useGame((s) => s.creatures);
  const eggs = useGame((s) => s.eggs);
  const ranchLevel = useGame((s) => s.ranchLevel);
  const activeTeam = useGame((s) => s.activeTeam);
  const creatureFoods = useGame((s) => s.creatureFoods);
  const crops = useGame((s) => s.crops);
  const coin = useGame((s) => s.coin);

  const feedCreature = useGame((s) => s.feedCreature);
  const craftCreatureFood = useGame((s) => s.craftCreatureFood);
  const hatchEgg = useGame((s) => s.hatchEgg);
  const setTeamSlot = useGame((s) => s.setTeamSlot);
  const upgradeRanch = useGame((s) => s.upgradeRanch);

  const [selectedCreature, setSelectedCreature] = useState<CreatureInstance | null>(
    creatures[0] || null
  );
  const [tab, setTab] = useState<'creatures' | 'eggs' | 'kitchen'>('creatures');

  const maxCapacity = [5, 10, 20, 30][ranchLevel - 1] || 5;
  const ranchUpgradeCost = [200, 500, 1200][ranchLevel - 1];

  return (
    <section className="panel view-enter" aria-labelledby="ranch-title">
      <div className="panel__head flex flex-wrap items-center justify-between gap-3">
        <div className="panel__title flex items-center gap-2">
          <span className="panel__title-icon" aria-hidden>🛖</span>
          <div>
            <h2 id="ranch-title">Trại Thú &amp; Ấp Trứng</h2>
            <div className="panel__sub">Nuôi dưỡng, chăm sóc và chuẩn bị đội hình chiến đấu.</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="chip font-bold text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
            🛖 Trại Cấp {ranchLevel} ({creatures.length}/{maxCapacity} thú)
          </div>
          {ranchUpgradeCost && (
            <motion.button
              className="btn btn--sm btn--gold flex items-center gap-1 font-bold"
              disabled={coin < ranchUpgradeCost}
              onClick={upgradeRanch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUpCircle className="w-4 h-4" /> Nâng cấp (🪙 {ranchUpgradeCost})
            </motion.button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="tabs my-4 border-b border-amber-900/10 pb-2">
        <button
          className={`tab ${tab === 'creatures' ? 'tab--active' : ''}`}
          onClick={() => setTab('creatures')}
        >
          🐲 Đàn Thú ({creatures.length})
        </button>
        <button
          className={`tab ${tab === 'eggs' ? 'tab--active' : ''}`}
          onClick={() => setTab('eggs')}
        >
          🥚 Lồng Ấp Trứng ({eggs.length})
        </button>
        <button
          className={`tab ${tab === 'kitchen' ? 'tab--active' : ''}`}
          onClick={() => setTab('kitchen')}
        >
          🍳 Bếp Chế Thức Ăn
        </button>
      </div>

      {/* Main Content */}
      {tab === 'creatures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creature List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {creatures.map((c) => {
              const species = ALL_CREATURES.find((s) => s.id === c.speciesId);
              const element = ELEMENT_INFO[c.element];
              const isInTeam = activeTeam.includes(c.id);
              const isSelected = selectedCreature?.id === c.id;

              return (
                <motion.div
                  key={c.id}
                  className={`card cursor-pointer transition-all p-3 rounded-2xl border-2 ${
                    isSelected ? 'border-amber-400 bg-amber-500/10 shadow-lg' : 'border-amber-900/20 bg-white/80'
                  }`}
                  onClick={() => setSelectedCreature(c)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl" aria-hidden>{species?.icon}</span>
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-1">
                          {c.name} {c.isShiny && <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />}
                        </div>
                        <div className="text-xs text-amber-900/60 font-semibold">
                          Lv.{c.level} · G{c.generation}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-sm" style={{ background: element.color }}>
                      {element.icon} {element.name}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-bold flex items-center justify-between text-amber-950">
                    <span>❤️ HP: {c.stats.hp}/{c.stats.maxHp}</span>
                    <span>💧 Mana: {c.stats.mana}/{c.stats.maxMana}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-900/10">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Thân thiết: {c.bond}%
                    </span>
                    {isInTeam ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-400 text-amber-950">
                        ⚔️ Trong Đội
                      </span>
                    ) : (
                      <button
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTeam.length < 3) {
                            setTeamSlot(activeTeam.length, c.id);
                          } else {
                            setTeamSlot(0, c.id);
                          }
                        }}
                      >
                        + Thêm Đội Chiến
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Inspect Panel */}
          {selectedCreature && (
            <div className="panel bg-amber-500/5 p-4 rounded-2xl border-2 border-amber-900/20">
              <div className="text-center pb-3 border-b border-amber-900/10">
                <div className="text-5xl my-2" aria-hidden>
                  {ALL_CREATURES.find((s) => s.id === selectedCreature.speciesId)?.icon}
                </div>
                <h3 className="text-xl font-extrabold text-amber-950">{selectedCreature.name}</h3>
                <div className="text-xs font-bold text-amber-900/70 mt-0.5">
                  Thế thế G{selectedCreature.generation} · Cấp {selectedCreature.level}
                </div>
              </div>

              {/* Gene Grades */}
              <div className="my-3">
                <div className="text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                  <Dna className="w-4 h-4 text-teal-600" /> Phẩm Phụ Gene:
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-extrabold">
                  {(Object.keys(selectedCreature.geneGrades) as Array<keyof typeof selectedCreature.geneGrades>).map((k) => (
                    <div key={k} className="p-1 rounded-lg bg-white/90 border border-amber-900/10">
                      <div className="uppercase text-[10px] text-amber-900/60">{k}</div>
                      <div style={{ color: GRADE_COLORS[selectedCreature.geneGrades[k]] }}>
                        {selectedCreature.geneGrades[k]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="my-3 space-y-1 text-xs font-extrabold text-amber-950">
                <div className="flex justify-between">
                  <span>⚔️ Tấn Công (ATK):</span>
                  <span>{selectedCreature.stats.atk}</span>
                </div>
                <div className="flex justify-between">
                  <span>🛡️ Phòng Thủ (DEF):</span>
                  <span>{selectedCreature.stats.def}</span>
                </div>
                <div className="flex justify-between">
                  <span>✨ Phép Thuật (MAG):</span>
                  <span>{selectedCreature.stats.mag}</span>
                </div>
                <div className="flex justify-between">
                  <span>⚡ Tốc Độ (SPD):</span>
                  <span>{selectedCreature.stats.spd}</span>
                </div>
              </div>

              {/* Feed options */}
              <div className="mt-4 pt-3 border-t border-amber-900/10">
                <div className="text-xs font-bold text-amber-950 mb-2 flex items-center gap-1">
                  <ChefHat className="w-4 h-4 text-amber-600" /> Cho Ăn Tăng Chỉ Số:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(CREATURE_FOODS).map((f) => {
                    const count = creatureFoods[f.id] || 0;
                    return (
                      <button
                        key={f.id}
                        className="btn btn--sm btn--ghost flex items-center justify-between text-xs p-1.5"
                        disabled={count < 1}
                        onClick={() => feedCreature(selectedCreature.id, f.id)}
                      >
                        <span>{f.icon} {f.name}</span>
                        <span className="font-extrabold">x{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incubator Eggs Tab */}
      {tab === 'eggs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eggs.length === 0 && (
            <div className="col-span-3 text-center py-10 text-amber-900/60 font-bold">
              <EggIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              Chưa có trứng nào trong lồng ấp. Hãy lai thú ở Phòng Gene hoặc nhận quà chiến đấu!
            </div>
          )}
          {eggs.map((e) => {
            const species = ALL_CREATURES.find((s) => s.id === e.speciesId);
            const readyToHatch = e.daysRemaining <= 0;

            return (
              <motion.div
                key={e.id}
                className="card text-center p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-900/20 flex flex-col items-center justify-between"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-5xl my-2" aria-hidden>
                  {readyToHatch ? '🐣' : '🥚'}
                </div>
                <div className="font-extrabold text-sm text-amber-950">
                  Trứng {species?.name || 'Bí Ẩn'} (G{e.generation})
                </div>
                <div className="text-xs font-semibold text-amber-900/70 mt-1">
                  {readyToHatch ? 'Sẵn sàng nở!' : `Còn ${e.daysRemaining} ngày ấp`}
                </div>
                {e.parentA && (
                  <div className="text-[11px] text-amber-900/50 mt-1">
                    Bố mẹ: {e.parentA} + {e.parentB}
                  </div>
                )}
                <motion.button
                  className="btn btn--gold btn--sm mt-3 w-full"
                  disabled={!readyToHatch}
                  onClick={() => hatchEgg(e.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {readyToHatch ? '✨ Cho Trứng Nở' : 'Đang Ấp…'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Kitchen Tab */}
      {tab === 'kitchen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(CREATURE_FOODS).map((f) => {
            const currentOwned = creatureFoods[f.id] || 0;
            const canCraft = Object.entries(f.cropReq).every(
              ([crop, req]) => (crops[crop] || 0) >= req
            );

            return (
              <div key={f.id} className="card p-4 rounded-2xl bg-white/90 border-2 border-amber-900/20">
                <div className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden>{f.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-base text-amber-950">{f.name}</h4>
                    <p className="text-xs text-amber-900/70 font-semibold">{f.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-900/10 flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                    <span>Yêu cầu:</span>
                    {Object.entries(f.cropReq).map(([crop, req]) => (
                      <span key={crop} className={(crops[crop] || 0) >= req ? 'text-emerald-700' : 'text-rose-600'}>
                        {PLANTS[crop]?.icon} {crops[crop] || 0}/{req}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    className="btn btn--sm btn--teal"
                    disabled={!canCraft}
                    onClick={() => craftCreatureFood(f.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Chế Tạo (Đang có: {currentOwned})
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
