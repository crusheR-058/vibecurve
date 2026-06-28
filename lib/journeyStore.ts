import { create } from "zustand";

/**
 * The journey's shared state. `progress` (0..1) is the scroll position that
 * drives the virtual camera; `loaded` gates the intro. High-frequency pointer
 * data lives in a plain mutable ref (not store state) so 60fps mouse updates
 * never trigger React re-renders — the 3D scene reads it in useFrame.
 */
interface JourneyState {
  progress: number;
  loaded: boolean;
  setProgress: (p: number) => void;
  setLoaded: (b: boolean) => void;
}

export const useJourney = create<JourneyState>((set) => ({
  progress: 0,
  loaded: false,
  setProgress: (progress) => set({ progress }),
  setLoaded: (loaded) => set({ loaded }),
}));

/** Normalized pointer (-1..1), updated by SmoothScroll, read by useFrame. */
export const pointer = { x: 0, y: 0 };
