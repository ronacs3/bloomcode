'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Swords, Shield } from 'lucide-react';
import { useGame } from '@/stores/gameStore';
import { ALL_CREATURES, ELEMENT_INFO, type CreatureInstance } from '@/data/creatures';
import { BATTLE_STAGES, createEnemyInstance, type BattleStage } from '@/data/battles';
import { CREATURE_SKILLS } from '@/data/creatureSkills';

export default function BattleView() {
  const activeTeamIds = useGame((s) => s.activeTeam);
  const creatures = useGame((s) => s.creatures);
  const gainCreatureXp = useGame((s) => s.gainCreatureXp);
  const addEgg = useGame((s) => s.addEgg);
  const sfx = useGame((s) => s.sfx);

  const playerTeam = activeTeamIds
    .map((id) => creatures.find((c) => c.id === id))
    .filter(Boolean) as CreatureInstance[];

  const [stage, setStage] = useState<BattleStage | null>(null);
  const [battleEnemies, setBattleEnemies] = useState<CreatureInstance[]>([]);
  const [playerCreatures, setPlayerCreatures] = useState<CreatureInstance[]>([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [activeEnemyIdx, setActiveEnemyIdx] = useState<number>(0);

  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [battleOver, setBattleOver] = useState<'win' | 'lose' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const startBattle = (selectedStage: BattleStage) => {
    if (playerTeam.length === 0) return;
    sfx('click');

    const freshPlayerTeam = playerTeam.map((c) => ({
      ...c,
      stats: { ...c.stats, hp: c.stats.maxHp, mana: c.stats.maxMana },
    }));

    const enemies = selectedStage.enemies.map((e) =>
      createEnemyInstance(e.speciesId, e.name, e.level, e.shiny)
    );

    setStage(selectedStage);
    setPlayerCreatures(freshPlayerTeam);
    setBattleEnemies(enemies);
    setActivePlayerIdx(0);
    setActiveEnemyIdx(0);
    setBattleOver(null);
    setCombatLog([`⚔️ Trận đấu ${selectedStage.name} bắt đầu!`]);

    // SPD determines first turn
    const pSpd = freshPlayerTeam[0]?.stats.spd || 10;
    const eSpd = enemies[0]?.stats.spd || 10;
    setTurn(pSpd >= eSpd ? 'player' : 'enemy');
  };

  const activeP = playerCreatures[activePlayerIdx];
  const activeE = battleEnemies[activeEnemyIdx];

  const handlePlayerAction = (actionType: 'attack' | 'skill' | 'guard', skillId?: string) => {
    if (!activeP || !activeE || isProcessing || battleOver || turn !== 'player') return;

    setIsProcessing(true);
    sfx('click');

    let damage = 0;
    let logMsg = '';
    const nextPlayers = [...playerCreatures];
    const curP = { ...nextPlayers[activePlayerIdx], stats: { ...nextPlayers[activePlayerIdx].stats } };
    const nextEnemies = [...battleEnemies];
    const targetE = { ...nextEnemies[activeEnemyIdx], stats: { ...nextEnemies[activeEnemyIdx].stats } };

    if (actionType === 'attack') {
      const atk = curP.stats.atk;
      const def = targetE.stats.def;
      damage = Math.max(10, Math.round(atk * 1.5 - def * 0.5));
      logMsg = `💥 ${curP.name} dùng Húc Đầu xé rách ${targetE.name} gây ${damage} sát thương!`;
    } else if (actionType === 'skill' && skillId) {
      const skill = CREATURE_SKILLS[skillId];
      if (skill && curP.stats.mana >= skill.manaCost) {
        curP.stats.mana -= skill.manaCost;

        const eleInfo = ELEMENT_INFO[curP.element];
        const isStrong = eleInfo.strongAgainst.includes(targetE.element);
        const mul = isStrong ? 1.5 : 1.0;

        if (skill.category === 'heal') {
          const healVal = Math.round(curP.stats.mag * (skill.power / 100));
          curP.stats.hp = Math.min(curP.stats.maxHp, curP.stats.hp + healVal);
          logMsg = `💚 ${curP.name} sử dụng ${skill.name} hồi phục ${healVal} HP!`;
        } else {
          const magOrAtk = skill.category === 'magic' ? curP.stats.mag : curP.stats.atk;
          damage = Math.max(15, Math.round(magOrAtk * (skill.power / 100) * mul - targetE.stats.def * 0.4));
          logMsg = `✨ ${curP.name} thi triển ${skill.name} ${isStrong ? '(Khắc Hệ!)' : ''} gây ${damage} sát thương lên ${targetE.name}!`;
        }
      }
    } else if (actionType === 'guard') {
      logMsg = `🛡️ ${curP.name} vào tư thế phòng thủ gia tăng giáp!`;
    }

    nextPlayers[activePlayerIdx] = curP;
    setPlayerCreatures(nextPlayers);

    if (damage > 0) {
      targetE.stats.hp = Math.max(0, targetE.stats.hp - damage);
      nextEnemies[activeEnemyIdx] = targetE;
      setBattleEnemies(nextEnemies);
    }

    setCombatLog((prev) => [logMsg, ...prev.slice(0, 5)]);

    // Check enemy fainted
    if (targetE.stats.hp <= 0) {
      sfx('unlock');
      setCombatLog((prev) => [`☠️ ${targetE.name} đã gục ngã!`, ...prev.slice(0, 5)]);

      if (activeEnemyIdx + 1 < battleEnemies.length) {
        setActiveEnemyIdx(activeEnemyIdx + 1);
        setIsProcessing(false);
        setTurn('player');
      } else {
        // Player Wins!
        setBattleOver('win');
        setIsProcessing(false);
        sfx('discover');
        void confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

        // Grant XP & Rewards
        if (stage) {
          playerTeam.forEach((c) => gainCreatureXp(c.id, stage.minLevel * 40));
          if (stage.rewardEggSpecies) addEgg(stage.rewardEggSpecies);
        }
      }
      return;
    }

    // Pass turn to Enemy
    setTurn('enemy');
    setTimeout(() => runEnemyTurn(nextEnemies), 1000);
  };

  const runEnemyTurn = (currentEnemies: CreatureInstance[]) => {
    const enemy = currentEnemies[activeEnemyIdx];
    if (!enemy || !activeP) {
      setIsProcessing(false);
      return;
    }

    const nextPlayers = [...playerCreatures];
    const targetP = { ...nextPlayers[activePlayerIdx] };

    const atk = enemy.stats.atk;
    const def = targetP.stats.def;
    const damage = Math.max(8, Math.round(atk * 1.4 - def * 0.5));
    targetP.stats.hp = Math.max(0, targetP.stats.hp - damage);
    nextPlayers[activePlayerIdx] = targetP;

    setPlayerCreatures(nextPlayers);
    setCombatLog((prev) => [
      `🔥 ${enemy.name} đáp trả tấn công ${targetP.name} gây ${damage} sát thương!`,
      ...prev.slice(0, 5),
    ]);

    if (targetP.stats.hp <= 0) {
      sfx('error');
      setCombatLog((prev) => [`🥀 ${targetP.name} của bạn đã gục ngã!`, ...prev.slice(0, 5)]);

      if (activePlayerIdx + 1 < playerCreatures.length) {
        setActivePlayerIdx(activePlayerIdx + 1);
        setTurn('player');
      } else {
        setBattleOver('lose');
      }
    } else {
      setTurn('player');
    }
    setIsProcessing(false);
  };

  return (
    <section className="panel view-enter" aria-labelledby="battle-title">
      <div className="panel__head flex items-center justify-between">
        <div className="panel__title flex items-center gap-2">
          <span className="panel__title-icon" aria-hidden>⚔️</span>
          <div>
            <h2 id="battle-title">Đấu Trường 3v3</h2>
            <div className="panel__sub">Xây dựng đội hình 3 sinh vật để chinh phục các giải đấu.</div>
          </div>
        </div>
      </div>

      {/* Stage Selector */}
      {!stage && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BATTLE_STAGES.map((st) => (
            <motion.div
              key={st.id}
              className="card p-4 rounded-2xl bg-white/90 border-2 border-amber-900/20 flex flex-col justify-between"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                  <span>{st.icon}</span>
                  <span className="text-base text-amber-950">{st.name}</span>
                </div>
                <p className="text-xs text-amber-900/70 font-semibold mb-3">{st.description}</p>
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <span>Yêu cầu Cấp {st.minLevel}</span>
                  <span>🪙 +{st.rewardCoins} xu</span>
                  <span>🧬 +{st.rewardGp} GP</span>
                </div>
              </div>

              <motion.button
                className="btn btn--gold btn--sm mt-4 w-full"
                disabled={playerTeam.length === 0}
                onClick={() => startBattle(st)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {playerTeam.length > 0 ? '⚔️ Vào Trận Đấu' : 'Cần Thêm Đội Hình'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Battle Arena View */}
      {stage && activeP && activeE && (
        <div className="mt-4 flex flex-col items-center">
          {/* Battle Stage Header */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="font-extrabold text-sm text-amber-950 flex items-center gap-1">
              {stage.icon} {stage.name}
            </span>
            <button
              className="btn btn--sm btn--ghost text-xs"
              onClick={() => setStage(null)}
            >
              ↩ Rút Lui
            </button>
          </div>

          {/* Combat Stage Layout */}
          <div className="w-full rounded-2xl bg-gradient-to-b from-sky-900/40 via-emerald-950/50 to-amber-950/70 p-6 border-4 border-amber-900/40 shadow-2xl relative overflow-hidden">
            {/* Enemy Side */}
            <div className="flex items-center justify-between mb-10">
              <div className="bg-black/60 p-3 rounded-xl border border-rose-500/40 text-white min-w-[200px]">
                <div className="font-bold text-sm">{activeE.name} (Lv.{activeE.level})</div>
                <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden my-1">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${(activeE.stats.hp / activeE.stats.maxHp) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-rose-300">
                  HP: {activeE.stats.hp}/{activeE.stats.maxHp}
                </div>
              </div>

              <motion.div
                key={activeE.id}
                className="text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {ALL_CREATURES.find((s) => s.id === activeE.speciesId)?.icon}
              </motion.div>
            </div>

            {/* Player Side */}
            <div className="flex items-center justify-between mt-10">
              <motion.div
                key={activeP.id}
                className="text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              >
                {ALL_CREATURES.find((s) => s.id === activeP.speciesId)?.icon}
              </motion.div>

              <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/40 text-white min-w-[200px]">
                <div className="font-bold text-sm">{activeP.name} (Lv.{activeP.level})</div>
                <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden my-1">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(activeP.stats.hp / activeP.stats.maxHp) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-emerald-300">
                  HP: {activeP.stats.hp}/{activeP.stats.maxHp} · Mana: {activeP.stats.mana}/{activeP.stats.maxMana}
                </div>
              </div>
            </div>
          </div>

          {/* Combat Log Box */}
          <div className="w-full my-3 p-3 bg-black/80 rounded-xl text-xs font-mono text-emerald-400 space-y-1 max-h-24 overflow-y-auto">
            {combatLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>

          {/* Action Control Panel */}
          {!battleOver && (
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
              <motion.button
                className="btn btn--gold font-bold p-3 flex flex-col items-center"
                disabled={turn !== 'player' || isProcessing}
                onClick={() => handlePlayerAction('attack')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Swords className="w-5 h-5 mb-1" />
                <span>💥 Tấn Công</span>
              </motion.button>

              {activeP.skills.map((skillId) => {
                const sk = CREATURE_SKILLS[skillId];
                if (!sk) return null;
                const canAfford = activeP.stats.mana >= sk.manaCost;

                return (
                  <motion.button
                    key={sk.id}
                    className="btn btn--sky font-bold p-3 flex flex-col items-center"
                    disabled={turn !== 'player' || isProcessing || !canAfford}
                    onClick={() => handlePlayerAction('skill', sk.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-base">{sk.icon}</span>
                    <span className="text-xs">{sk.name} ({sk.manaCost} MP)</span>
                  </motion.button>
                );
              })}

              <motion.button
                className="btn btn--teal font-bold p-3 flex flex-col items-center"
                disabled={turn !== 'player' || isProcessing}
                onClick={() => handlePlayerAction('guard')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Shield className="w-5 h-5 mb-1" />
                <span>🛡️ Phòng Thủ</span>
              </motion.button>
            </div>
          )}

          {/* Battle Over Result Modal */}
          {battleOver && (
            <div className="my-4 p-6 bg-amber-500/10 rounded-2xl border-2 border-amber-500 text-center w-full">
              <div className="text-4xl mb-2">{battleOver === 'win' ? '🏆' : '💀'}</div>
              <h3 className="text-2xl font-extrabold text-amber-950">
                {battleOver === 'win' ? 'CHIẾN THẮNG RỰC RỠ!' : 'THẤT BẠI TẠI THỬ THÁCH'}
              </h3>
              <p className="text-xs font-bold text-amber-900/70 mt-1">
                {battleOver === 'win'
                  ? `Nhận +${stage.rewardCoins} Xu, +${stage.rewardGp} GP và Kinh Nghiệm thăng cấp cho toàn đội!`
                  : 'Hãy chăm sóc sinh vật và chế tạo thêm thức ăn để tăng cường sức mạnh.'}
              </p>
              <motion.button
                className="btn btn--gold btn--lg mt-4"
                onClick={() => setStage(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Quay Lại Đấu Trường
              </motion.button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
