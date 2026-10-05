'use client';

import { useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';

import { useGame } from '@/stores/gameStore';
import { ALL_PLANTS, PLANTS } from '@/data/plants';
import { RARITY_INFO } from '@/data/genes';
import { SOILS, SOIL_KIT_IDS, SPRINKLER_PRICE } from '@/data/world';
import PlantIcon from '@/components/ui/PlantIcon';

type Tab = 'seeds' | 'sell' | 'upgrades';

function SeedsTab() {
  const coin = useGame((s) => s.coin);
  const owned = useGame((s) => s.seeds);
  const found = useGame((s) => s.discovered.length);
  const buy = useGame((s) => s.buySeed);
  const shopPlants = ALL_PLANTS.filter((p) => p.seedPrice !== undefined);

  return (
    <div className="grid-cards">
      {shopPlants.map((p) => {
        const locked = (p.unlockAt ?? 0) > found;
        const price = p.seedPrice!;
        return (
          <motion.div
            key={p.id}
            className="card"
            style={locked ? { opacity: 0.75 } : undefined}
            whileHover={{ y: -3 }}
          >
            {(owned[p.id] ?? 0) > 0 && <span className="card__qty">có {owned[p.id]}</span>}
            <PlantIcon id={p.id} size={56} silhouette={locked} float={!locked} />
            <div className="card__name">{locked ? 'Hạt giống bị khoá' : p.name}</div>
            <div className="card__meta">
              {locked ? `Khám phá ${p.unlockAt} loài để mở khoá` : `Bán được 🪙 ${p.cropPrice} · ${p.days} ngày`}
            </div>
            <span className="price">🪙 {price}</span>
            <div className="card__actions">
              <motion.button
                id={`buy-${p.id}-1`}
                className="btn btn--sm"
                disabled={locked || coin < price}
                onClick={() => buy(p.id, 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mua 1
              </motion.button>
              <motion.button
                id={`buy-${p.id}-5`}
                className="btn btn--sm btn--teal"
                disabled={locked || coin < price * 5}
                onClick={() => buy(p.id, 5)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ×5
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function SellTab() {
  const crops = useGame((s) => s.crops);
  const sell = useGame((s) => s.sellCrop);
  const sellAll = useGame((s) => s.sellAllCrops);
  const list = Object.entries(crops)
    .filter(([, q]) => (q ?? 0) > 0)
    .sort(([a], [b]) => PLANTS[a].dex - PLANTS[b].dex);
  const total = list.reduce((s, [id, q]) => s + PLANTS[id].cropPrice * (q ?? 0), 0);

  if (list.length === 0) {
    return (
      <div className="empty">
        <span className="empty__icon">🧺</span>
        Chưa có gì để bán. Hãy thu hoạch nông sản ở nông trại nhé!
      </div>
    );
  }

  return (
    <>
      <div className="shop-banner">
        <span style={{ fontSize: 30 }} aria-hidden>💰</span>
        <span style={{ flex: 1 }}>
          Nông sản của bạn trị giá <b>🪙 {total.toLocaleString('vi-VN')}</b>. Mẹo: giữ lại vài cây mỗi loại để lai ghép ở Phòng Gene!
        </span>
        <button id="sell-all" className="btn btn--gold" onClick={sellAll}>Bán tất cả</button>
      </div>
      <div className="grid-cards mt-4">
        {list.map(([id, q]) => {
          const p = PLANTS[id];
          const rc = RARITY_INFO[p.rarity].color;
          return (
            <div key={id} className={`card ${p.rarity !== 'common' ? 'card--rare' : ''}`} style={{ '--rc': rc } as CSSProperties}>
              <span className="card__qty">×{q}</span>
              {p.rarity !== 'common' && (
                <span className="card__badge rarity" style={{ '--rc': rc } as CSSProperties}>{RARITY_INFO[p.rarity].label}</span>
              )}
              <PlantIcon id={id} size={56} />
              <div className="card__name">{p.name}</div>
              <span className="price">+🪙 {p.cropPrice} / cái</span>
              <div className="card__actions">
                <button id={`sell-${id}-1`} className="btn btn--sm btn--ghost" onClick={() => sell(id, 1)}>Bán 1</button>
                <button id={`sell-${id}-all`} className="btn btn--sm btn--gold" onClick={() => sell(id, q ?? 0)}>Hết</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function UpgradesTab() {
  const coin = useGame((s) => s.coin);
  const soils = useGame((s) => s.soils);
  const sprinkler = useGame((s) => s.sprinkler);
  const buySoil = useGame((s) => s.buySoil);
  const buySprinkler = useGame((s) => s.buySprinkler);

  return (
    <div className="list-grid">
      <div className="upgrade-card">
        <span className="upgrade-card__icon" aria-hidden>💦</span>
        <div className="upgrade-card__body">
          <div className="upgrade-card__name">Vòi tưới tự động</div>
          <div className="upgrade-card__desc">Tự tưới mọi cây đang lớn vào mỗi sáng. Không còn mầm non khát nước.</div>
        </div>
        <button id="buy-sprinkler" className="btn btn--sky" disabled={sprinkler || coin < SPRINKLER_PRICE} onClick={buySprinkler}>
          {sprinkler ? 'Đã lắp đặt' : `🪙 ${SPRINKLER_PRICE}`}
        </button>
      </div>
      {SOIL_KIT_IDS.map((id) => {
        const s = SOILS[id];
        return (
          <div key={id} className="upgrade-card">
            <span className="upgrade-card__icon" aria-hidden>{s.icon}</span>
            <div className="upgrade-card__body">
              <div className="upgrade-card__name">
                Bộ {s.name} {(soils[id] ?? 0) > 0 && <span className="chip">có {soils[id]}</span>}
              </div>
              <div className="upgrade-card__desc">{s.description} Dùng từ thanh công cụ ở nông trại.</div>
            </div>
            <button id={`buy-soil-${id}`} className="btn btn--gold" disabled={coin < s.price} onClick={() => buySoil(id)}>
              🪙 {s.price}
            </button>
          </div>
        );
      })}
      <div className="upgrade-card">
        <span className="upgrade-card__icon" aria-hidden>🗺️</span>
        <div className="upgrade-card__body">
          <div className="upgrade-card__name">Mở rộng đất trồng</div>
          <div className="upgrade-card__desc">Nhấn vào ô đất bị khoá 🔒 ở nông trại để mua. Mỗi ô sau sẽ đắt hơn một chút.</div>
        </div>
      </div>
    </div>
  );
}

export default function ShopView() {
  const [tab, setTab] = useState<Tab>('seeds');
  const cropCount = useGame((s) => Object.values(s.crops).reduce<number>((a, b) => a + (b ?? 0), 0));

  return (
    <section className="panel view-enter" aria-labelledby="shop-title">
      <div className="panel__head">
        <div className="panel__title">
          <span className="panel__title-icon" aria-hidden>🛒</span>
          <div>
            <h2 id="shop-title">Tạp hoá Làng</h2>
            <div className="panel__sub">Hạt giống, bộ đất và nâng cấp nông trại. Thu mua mọi loại nông sản!</div>
          </div>
        </div>
        <div className="tabs" role="tablist">
          <button role="tab" id="shop-tab-seeds" className="tab" aria-selected={tab === 'seeds'} onClick={() => setTab('seeds')}>🌱 Hạt giống</button>
          <button role="tab" id="shop-tab-sell" className="tab" aria-selected={tab === 'sell'} onClick={() => setTab('sell')}>
            💰 Bán {cropCount > 0 && <span className="tab__count">{cropCount}</span>}
          </button>
          <button role="tab" id="shop-tab-upgrades" className="tab" aria-selected={tab === 'upgrades'} onClick={() => setTab('upgrades')}>🧰 Nâng cấp</button>
        </div>
      </div>
      {tab === 'seeds' && <SeedsTab />}
      {tab === 'sell' && <SellTab />}
      {tab === 'upgrades' && <UpgradesTab />}
    </section>
  );
}
