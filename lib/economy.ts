"use client";

import { create } from "zustand";
import { today } from "@/lib/time";

// ──────────────────────────────────────────────────────────────────────────
// The Warmth Economy — a UI-only soft-currency layer ("Embers ✦").
//
// Persisted in localStorage (vc:economy), mirroring lib/session.ts. There is no
// backend and no real payment: "buying" embers just grants them. The whole
// design is experience-first — every paid action has a free fallback, new souls
// arrive with a starter pouch, the day quietly tops you up, and giving warmth
// refills the giver, so no one is ever priced out of taking part.
// ──────────────────────────────────────────────────────────────────────────

export interface Echo {
  id: string;
  text: string;
  emoji: string;
  roomId: string;
  keptAt: number;
}

export const STARTER_EMBERS = 15;
export const DAILY_EMBERS = 3;
const KEY = "vc:economy";

interface Persisted {
  embers: number;
  plus: boolean;
  ownedPacks: string[];
  aura: string;
  echoes: Echo[];
  warmthReach: number;
  lightsGiven: number;
  lastFreeLight: string; // yyyy-mm-dd of the last free light given
  lastDailyGrant: string; // yyyy-mm-dd of the last daily top-up
}

interface EconomyState extends Persisted {
  hydrated: boolean;
  hydrate: () => void;
  grant: (n: number) => void;
  spend: (n: number) => boolean; // false when short — caller opens GetEmbers
  unlockPack: (id: string) => void;
  setAura: (id: string) => void;
  keepEcho: (e: Echo) => void;
  hasEcho: (id: string) => boolean;
  hasFreeLight: () => boolean;
  giveLight: () => "free" | "ember" | "none";
  addWarmthReach: (n: number) => void;
  setPlus: (v: boolean) => void;
}

function defaults(): Persisted {
  return {
    embers: STARTER_EMBERS,
    plus: false,
    ownedPacks: [],
    aura: "ember",
    echoes: [],
    warmthReach: 0,
    lightsGiven: 0,
    lastFreeLight: "",
    lastDailyGrant: "",
  };
}

// Read persisted state and apply the once-a-day top-up. Runs only on the client
// (inside hydrate), so the store's initial render stays deterministic for SSR.
function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // first ever visit: starter pouch only, mark today so we don't double-grant
      const fresh = defaults();
      fresh.lastDailyGrant = today();
      return fresh;
    }
    const saved: Persisted = { ...defaults(), ...(JSON.parse(raw) as Partial<Persisted>) };
    if (saved.lastDailyGrant !== today()) {
      saved.embers += DAILY_EMBERS;
      saved.lastDailyGrant = today();
    }
    return saved;
  } catch {
    return defaults();
  }
}

export const useEconomy = create<EconomyState>((set, get) => {
  const save = () => {
    if (typeof window === "undefined") return;
    const s = get();
    const data: Persisted = {
      embers: s.embers,
      plus: s.plus,
      ownedPacks: s.ownedPacks,
      aura: s.aura,
      echoes: s.echoes,
      warmthReach: s.warmthReach,
      lightsGiven: s.lightsGiven,
      lastFreeLight: s.lastFreeLight,
      lastDailyGrant: s.lastDailyGrant,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* ignore quota / private-mode write errors */
    }
  };

  return {
    ...defaults(),
    hydrated: false,

    hydrate: () => {
      if (get().hydrated || typeof window === "undefined") return;
      set({ ...load(), hydrated: true });
      save();
    },

    grant: (n) => {
      set({ embers: get().embers + n });
      save();
    },

    spend: (n) => {
      if (get().embers < n) return false;
      set({ embers: get().embers - n });
      save();
      return true;
    },

    unlockPack: (id) => {
      if (get().ownedPacks.includes(id)) return;
      set({ ownedPacks: [...get().ownedPacks, id] });
      save();
    },

    setAura: (id) => {
      set({ aura: id });
      save();
    },

    keepEcho: (e) => {
      if (get().echoes.some((x) => x.id === e.id)) return;
      set({ echoes: [e, ...get().echoes] });
      save();
    },

    hasEcho: (id) => get().echoes.some((x) => x.id === id),

    hasFreeLight: () => get().lastFreeLight !== today(),

    // Spend a light: the day's free one first, then a single ember, else "none".
    giveLight: () => {
      const s = get();
      if (s.lastFreeLight !== today()) {
        set({ lastFreeLight: today(), lightsGiven: s.lightsGiven + 1 });
        save();
        return "free";
      }
      if (s.embers >= 1) {
        set({ embers: s.embers - 1, lightsGiven: s.lightsGiven + 1 });
        save();
        return "ember";
      }
      return "none";
    },

    addWarmthReach: (n) => {
      set({ warmthReach: get().warmthReach + n });
      save();
    },

    setPlus: (v) => {
      set({ plus: v, embers: v ? get().embers + 120 : get().embers });
      save();
    },
  };
});
