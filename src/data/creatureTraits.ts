export interface CreatureTrait {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const CREATURE_TRAITS: Record<string, CreatureTrait> = {
  hot_blood: {
    id: 'hot_blood',
    name: 'Máu Nóng',
    icon: '🔥',
    description: '+15% Sát thương ATK khi Máu (HP) xuống dưới 50%.',
  },
  photosynthesis: {
    id: 'photosynthesis',
    name: 'Quang Hợp',
    icon: '🌱',
    description: 'Tự động phục hồi 5% Máu mỗi lượt khi trời Nắng.',
  },
  moon_child: {
    id: 'moon_child',
    name: 'Đứa Con Của Trăng',
    icon: '🌙',
    description: 'Hồi 10 Mana mỗi lượt chiến đấu.',
  },
  overcharge: {
    id: 'overcharge',
    name: 'Phóng Điện Siêu Tốc',
    icon: '⚡',
    description: '+30% Tốc độ (SPD) ở lượt đánh đầu tiên.',
  },
  liquid_body: {
    id: 'liquid_body',
    name: 'Cơ Thể Chất Lỏng',
    icon: '💧',
    description: 'Giảm 15% sát thương vật lý nhận vào.',
  },
  thick_fur: {
    id: 'thick_fur',
    name: 'Lớp Lông Băng Băng',
    icon: '🛡️',
    description: '+15% Phòng thủ (DEF).',
  },
  burning_blood: {
    id: 'burning_blood',
    name: 'Dòng Máu Hỏa Phụng',
    icon: '🌋',
    description: '+20% Sát thương cho tất cả chiêu thức hệ Lửa.',
  },
};
