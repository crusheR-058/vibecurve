# design-sync notes — VibeCurve

## What this repo is
VibeCurve is a **Next.js 15 app**, not a published component library. There is no
`dist/` and no shipped `.d.ts`. The design system is the set of React components
under `components/` (ui primitives + scenes + immersive/landing/room). This sync
runs the **package shape** in a custom synth-entry configuration.

## Key architecture decisions (why the config looks unusual)
- **Explicit barrel entry** `.design-sync/ds-entry.tsx` (passed via `--entry`).
  Almost every component is `export default`; the converter's automatic
  synth-entry uses `export *`, which drops default exports. The barrel re-exports
  every component as a NAMED export so they land on `window.VibeCurve.<Name>`.
  **Keep the barrel and `cfg.componentSrcMap` in lockstep** — adding a component
  means editing both.
- **`cfg.componentSrcMap` lists every component.** With `--entry` set there is no
  `.d.ts` to discover from, so the map IS the component list (it also pins each
  src path for JSDoc/group enrichment).
- **`cfg.srcDir: "components"`** is required: the default src-root probe is
  `src | lib | components`, and this repo HAS a `lib/` (utils/stores, not
  components) that would otherwise win.
- **Build tsconfig** `.design-sync/tsconfig.dssync.json` carries the `@/` alias
  AND preview shims. The converter's esbuild paths plugin reads paths/baseUrl
  from this file **directly (it does not follow `extends`)**, so everything is
  inlined there.
- **Shims** (`.design-sync/shims/`) replace Next-only modules that have no
  meaning outside Next, so previews render in a plain browser bundle:
  - `next/link` → plain `<a>`
  - `next/dynamic` → `React.lazy` + `Suspense` (handles `dynamic(()=>import(...))`)
  - `next-auth/react` → unauthenticated stubs (matches the app's default
    AUTH-disabled state; `AuthButton`/`Login` render their signed-out branch)
- **CSS**: the styling idiom is **Tailwind utility classes + CSS-variable tokens**
  (`--canvas`, `--accent`, `rounded-button`, `bg-canvas`, …) defined in
  `app/globals.css`. There is no static stylesheet to ship, so
  `.design-sync/assets/ds-styles.css` is **generated** by running the repo's own
  Tailwind over `app/globals.css` + components (`cfg.cssEntry` points at it).
  It carries the tokens (`:root` light + `.dark`), the base layer, the custom
  utilities (`.glass`, `.font-serif-display`, …), and the brand fonts.
- **Fonts**: Inter + Instrument Serif are the real `next/font/google` families.
  The generated CSS loads them via a Google Fonts `@import` (→ `[FONT_REMOTE]`,
  loads at runtime) and binds `--font-inter` / `--font-instrument-serif` (which
  next/font normally injects). `cfg.runtimeFontPrefixes` suppresses any
  `[FONT_MISSING]`.
- **Theme**: the app is **dark by default** (`.dark` on `<html>`, set pre-paint;
  light is `:root`). The preview card paints a white body with no theme class,
  which would show the dark-forward brand in light mode. `cfg.provider`
  (`VibeCurveTheme`, defined in the barrel) wraps every preview in a `.dark`
  canvas surface so cards show the brand's signature look. The shipped
  `styles.css` stays faithful (light `:root` + `.dark`). `VibeCurveTheme` is NOT
  a real app provider — the app uses `SessionProvider` + `MotionConfig`.

## Re-build / re-sync recipe (this repo)
1. Regenerate the Tailwind CSS (component class usage may have changed):
   `npx tailwindcss -c tailwind.config.ts -i .design-sync/assets/ds-input.css -o .design-sync/assets/ds-styles.css`
2. Converter / driver: `--entry .design-sync/ds-entry.tsx --node-modules ./node_modules`.

## Re-sync risks (watch list)
- **Tailwind CSS is generated, not committed-as-truth.** If you forget step 1,
  newly-used utility classes will be missing from `styles.css` and those
  components render unstyled. Always regenerate before the build.
- **Barrel ↔ componentSrcMap drift**: a component added to the repo won't sync
  until it's added to BOTH `.design-sync/ds-entry.tsx` and `cfg.componentSrcMap`.
- **Fonts load remotely** (Google `@import`). If the headless render machine has
  no network, previews fall back to system fonts (esp. the serif display). If
  fidelity suffers, self-host the woff2 via `cfg.extraFonts`.
- App-coupled components (`AuthButton`, scenes reading session/router) only
  render their default/unauthenticated branch via the shims.
