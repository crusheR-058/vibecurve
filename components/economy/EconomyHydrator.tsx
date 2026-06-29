"use client";

import { useEffect } from "react";
import { useEconomy } from "@/lib/economy";

// Mounted once in app/providers.tsx. Hydrates the economy store from
// localStorage and applies the daily top-up — on the client only, so the
// store's initial render stays SSR-deterministic (UI gates on `hydrated`).
export default function EconomyHydrator() {
  const hydrate = useEconomy((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
