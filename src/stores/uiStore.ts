import { create } from 'zustand';
import type { WeatherId } from '@/data/world';

export type ToastTone = 'good' | 'bad' | 'info' | 'rare';

export interface Toast {
  id: number;
  icon: string;
  text: string;
  tone: ToastTone;
}

export interface PlotFx {
  key: number;
  text: string;
}

interface UiState {
  toasts: Toast[];
  discoveries: string[];
  plotFx: Record<number, PlotFx>;
  dayCard: { key: number; day: number; weather: WeatherId } | null;
  toast: (icon: string, text: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
  pushDiscovery: (id: string) => void;
  shiftDiscovery: () => void;
  fx: (plotId: number, text: string) => void;
  showDay: (day: number, weather: WeatherId) => void;
  hideDay: () => void;
}

let seq = 1;

export const useUi = create<UiState>((set, get) => ({
  toasts: [],
  discoveries: [],
  plotFx: {},
  dayCard: null,

  toast: (icon, text, tone = 'info') => {
    const id = seq++;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, icon, text, tone }] }));
    setTimeout(() => get().dismissToast(id), tone === 'rare' ? 4200 : 2600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  pushDiscovery: (id) => set((s) => ({ discoveries: [...s.discoveries, id] })),
  shiftDiscovery: () => set((s) => ({ discoveries: s.discoveries.slice(1) })),

  fx: (plotId, text) => set((s) => ({ plotFx: { ...s.plotFx, [plotId]: { key: seq++, text } } })),

  showDay: (day, weather) => {
    const key = seq++;
    set({ dayCard: { key, day, weather } });
    setTimeout(() => {
      if (get().dayCard?.key === key) set({ dayCard: null });
    }, 1900);
  },
  hideDay: () => set({ dayCard: null }),
}));
