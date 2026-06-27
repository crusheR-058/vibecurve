"use client";

// Theme = presence of the `dark` class on <html> (Tailwind class strategy).
// The initial class is set pre-paint by the inline script in app/layout.tsx;
// these helpers read/flip it at runtime and persist the choice. Default: dark.

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("vc:theme", theme);
  } catch {
    /* storage unavailable — class still applied for this session */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
