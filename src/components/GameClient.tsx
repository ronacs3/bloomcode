'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useGame } from '@/stores/gameStore';
import Header from '@/components/ui/Header';
import WeatherScene from '@/components/ui/WeatherScene';
import { DayCard, DiscoveryModal, IntroModal, Toasts } from '@/components/ui/Overlays';
import FarmView from '@/components/farm/FarmView';
import RanchView from '@/components/ranch/RanchView';
import GeneLabView from '@/components/lab/GeneLabView';
import BattleView from '@/components/battle/BattleView';
import GeneDexView from '@/components/genedex/GeneDexView';
import ShopView from '@/components/shop/ShopView';
import InventoryView from '@/components/inventory/InventoryView';

const subscribeHydration = (cb: () => void) => useGame.persist.onFinishHydration(cb);
const getHydrated = () => useGame.persist.hasHydrated();
const getServerHydrated = () => false;

export default function GameClient() {
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrated, getServerHydrated);
  const view = useGame((s) => s.view);
  const weather = useGame((s) => s.weather);

  useEffect(() => {
    // Load the local save once on the client (avoids SSR hydration mismatches).
    void useGame.persist.rehydrate();
  }, []);

  if (!hydrated) {
    return (
      <div className="splash" role="status" aria-label="Đang tải BLOOMCODE">
        <div className="splash__inner">
          <span className="splash__sprout" aria-hidden>🌱</span>
          <span className="logo__text" style={{ fontSize: 34 }}>BLOOMCODE</span>
          <span className="muted" style={{ fontWeight: 800 }}>Đang tưới hạt giống…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <WeatherScene weather={weather} />
      <div className="app">
        <Header />
        <main className="main" key={view}>
          {view === 'farm' && <FarmView />}
          {view === 'ranch' && <RanchView />}
          {view === 'lab' && <GeneLabView />}
          {view === 'battle' && <BattleView />}
          {view === 'genedex' && <GeneDexView />}
          {view === 'shop' && <ShopView />}
          {view === 'inventory' && <InventoryView />}
        </main>
      </div>
      <Toasts />
      <DayCard />
      <DiscoveryModal />
      <IntroModal />
    </>
  );
}
