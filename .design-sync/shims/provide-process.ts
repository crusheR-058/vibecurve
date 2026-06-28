// Side-effect shim: some components read `process.env.NEXT_PUBLIC_*` at module
// top level (e.g. AuthButton). In a plain browser bundle `process` is undefined,
// so that top-level access throws and aborts the whole IIFE before
// window.VibeCurve is assigned. esbuild only defines process.env.NODE_ENV, not
// other vars, so we provide a minimal process.env here. Imported FIRST in
// ds-entry.tsx so this runs before any component module body (ESM evaluates
// imported modules in source order).
declare const globalThis: { process?: { env: Record<string, string | undefined> } };

if (typeof globalThis.process === "undefined") {
  globalThis.process = { env: {} };
}
// Enable the auth UI so AuthButton renders its real signed-out chip in previews
// (the app gates it behind this NEXT_PUBLIC flag; default-off renders null).
globalThis.process.env.NEXT_PUBLIC_AUTH_ENABLED = "true";

export {};
