# 🌱 BLOOMCODE — Nông Trại Lai Tạo Gene & Đấu Trường Sinh Vật

> **BLOOMCODE** là một tựa game chiến thuật mô phỏng kết hợp giữa **Trồng trọt (Farming)**, **Lai tạo Gene (Gene Breeding)**, **Nuôi thú (Creature Ranch)** và **Đấu trường 3v3 Theo lượt (3v3 Turn-Based Battle)** trên nền tảng Web hiện đại.

---

## 🔁 Vòng Lặp Gameplay (Core Gameplay Loop)

```text
🌱 NÔNG TRẠI (Farming)
   ↓ (Thu hoạch nông sản đặc biệt)
🧪 PHÒNG GENE (Gene Lab - Tách gene & Lai giống cây)
   ↓ (Chế tạo thức ăn tăng chỉ số)
🛖 TRẠI THÚ (Creature Ranch - Nuôi dưỡng & Cho ăn)
   ↓ (Phối giống sinh vật di truyền Gene D → SS)
🥚 LỒNG ẤP (Incubator - Ấp trứng qua ngày mới)
   ↓ (Build đội hình 3 sinh vật)
⚔️ ĐẤU TRƯỜNG (3v3 Turn-Based Battle)
   ↓ (Nhận Xu, GP & Trứng hiếm)
📖 GENEDEX (Khám phá & Nghiên cứu loài mới)
```

---

## 🌟 Tính Năng Nổi Bật

### 🌾 1. Nông Trại Gene (Farming Core)
- Hệ thống lưới ô đất sinh động với đất thường, đất giàu dinh dưỡng, đất giữ ẩm và đất phun khoáng.
- Thời tiết biến đổi theo ngày: Nắng, Mưa, Giông sét, Tuyết rơi, Nhật thực... ảnh hưởng trực tiếp tới tỉ lệ sinh trưởng và đột biến.
- Công cụ chăm sóc: Cuốc đất, Tưới nước, Thu hoạch, Bón phân, Vòi tưới tự động.

### 🧪 2. Phòng Thí Nghiệm Gene (Gene Lab)
- **Lai Cây (Plant Breeding)**: Phối ghép các cặp nông sản kết hợp với chất xúc tác gene để khám phá 20+ giống cây lai hiếm.
- **Lai Thú (Creature Breeding)**: Phối giống 2 sinh vật nuôi, di truyền phẩm phẩm Gene (**D → C → B → A → S → SS**) và kích hoạt đột biến kỹ năng.
- **Tách Gene & Nâng Cấp**: Phân tách nông sản thu về Điểm Gene (🧬 GP) để nâng cấp thiết bị phòng thí nghiệm.

### 🐾 3. Trại Thú & Lồng Ấp (Creature Ranch)
- Sức chứa trại nâng cấp linh hoạt (5 → 30 sinh vật).
- **Bếp Chế Thức Ăn**: Chế tạo *Quả Sức Mạnh (ATK)*, *Dâu Mặt Trăng (MANA)*, *Củ Băng Giá (DEF)*, *Quả Sấm Sét (SPD)* từ nông sản.
- **Ấp Trứng**: Lồng ấp trứng tự động đếm ngược theo ngày trong game (`sleep`).

### ⚔️ 4. Đấu Trường Chiến Thuật 3v3 (Turn-Based Battle)
- Cơ chế tính lượt dựa trên chỉ số **Tốc độ (SPD)**.
- Quản lý thanh **Năng Lượng (MANA)** để triển khai kỹ năng Vật lý, Phép thuật, Hồi máu và Phòng thủ.
- **9 Hệ Nguyên Tố tương khắc**: *Nature, Fire, Water, Electric, Ice, Lunar, Solar, Eclipse, Cosmic*.
- 4 Cấp độ thử thách: *Rừng Hoang Dã*, *Núi Lửa Ember*, *Đấu Trường Hoàng Gia*, và *Trận Đấu Boss Drake*.

### 📖 5. Tra Cứu GeneDex (Pokedex System)
- Hỗ trợ chuyển đổi chế độ tra cứu song song giữa **GeneDex Nông Sản** và **CreatureDex Sinh Vật**.
- Hiển thị mô hình bóng mờ (silhouette), gợi ý công thức và bộ chỉ số di truyền.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: Next.js 15+ (App Router, React 19)
- **Language**: TypeScript (Strict type safety)
- **Styling**: Vanilla CSS Modules / Custom Glassmorphism UI Design System + Tailwind CSS v4
- **State Management**: Zustand (Kèm middleware Persist)
- **Data Persistence**: IndexedDB (Qua Dexie.js - Tự động lưu tiến trình game)
- **Animation & Motion**: Motion (Framer Motion) + Canvas Confetti
- **Icons & Visuals**: Lucide React + Render Emoji High Resolution
- **Audio / SFX**: Howler.js (Hiệu ứng âm thanh sinh động)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu môi trường:
- **Node.js**: `v18.0.0` trở lên
- **npm** hoặc **yarn** / **pnpm**

### Các bước khởi chạy:

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Chạy server phát triển (Development)**:
   ```bash
   npm run dev
   ```
   Trình duyệt tự động mở tại địa chỉ: `http://localhost:3000`

3. **Kiểm tra Type & Lỗi Linting**:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```

4. **Đóng gói Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```text
bloomcode/
├── src/
│   ├── app/                # App Router Layout & Page entry
│   ├── components/         # Các React View components
│   │   ├── farm/           # Nông trại & Phaser Canvas
│   │   ├── ranch/          # Trại thú & Lồng ấp
│   │   ├── lab/            # Phòng Gene (Lai cây & Lai thú)
│   │   ├── battle/         # Đấu trường 3v3
│   │   ├── genedex/        # Tra cứu GeneDex
│   │   ├── shop/           # Cửa hàng hạt giống & Nâng cấp
│   │   ├── inventory/      # Túi đồ & Nông sản
│   │   └── ui/             # Header, Modals, Overlays, Toasts
│   ├── data/               # Cấu hình dữ liệu game (Cây, Thú, Skill, Stage, Quests)
│   ├── stores/             # State Stores (gameStore, uiStore)
│   └── lib/                # Thuật toán lai ghép, DB Dexie, SFX Howler
└── public/                 # Assets tĩnh & Âm thanh
```

---

## 📜 Giấy Phép & Bản Quyền

Dự án được phát triển cho trải nghiệm chơi game trực tiếp trên trình duyệt Web. 
Chúc bạn có những giờ phút lai tạo gene và chinh phục đấu trường thú nuôi thật thú vị cùng **BLOOMCODE**! 🌟🌱🐲
