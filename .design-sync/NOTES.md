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

## Capturing / rendering: required harness patches (animation-heavy DS)
VibeCurve uses framer-motion everywhere, including `whileInView` / `useInView`
reveals and counters that only fire on IntersectionObserver and animate over
time. In headless capture they otherwise screenshot blank / mid-animation. Two
LOCAL patches to the staged `.ds-sync/` scripts fix this (re-apply after every
re-stage — `cp -r` overwrites them):
- `.ds-sync/package-capture.mjs`: in `settle()` add `await page.waitForTimeout(1400)`,
  and after `page.clock.setFixedTime(...)` add `await page.emulateMedia({ reducedMotion: 'reduce' })`.
- `.ds-sync/package-validate.mjs`: after `newPage(...)` add the same
  `emulateMedia({ reducedMotion: 'reduce' })`, and after the per-preview
  `page.goto(...networkidle)` add `await page.waitForTimeout(1400)`.
Reduced motion makes framer apply end states instantly (matches the app's
`<MotionConfig reducedMotion="user">`); the wait lets the IntersectionObserver
fire. Render the previews with the system Chrome via
`DS_CHROMIUM_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` (no
200MB Playwright chromium download needed — `npm i playwright` in `.ds-sync/`
with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).

## Preview authoring conventions (.design-sync/previews/<Name>.tsx)
- Import components from `'vibecurve'` (shimmed to `window.VibeCurve`); import
  data from `@/lib/*` (resolves via the dssync tsconfig).
- **Colors / type / radii / shadows → brand token classes** (guaranteed in the
  compiled CSS): `bg-canvas bg-card text-ink text-muted text-accent text-white
  border-hair rounded-card rounded-button rounded-full shadow-soft shadow-lift
  shadow-glow font-serif-display glass bg-accent-light bg-accent`.
- **Layout / sizing (height, width, flex, padding, gap) → INLINE styles.** A
  Tailwind utility used ONLY in a preview is not in the compiled CSS unless the
  CSS is regenerated (step 1 now scans previews), so inline styles keep previews
  self-contained and subagent-safe.
- **Absolute/inset-0 effects** (Aurora, VibrantAurora, FloatingParticles,
  CursorGlow, ScrollProgress): wrap in a sized `position:relative; overflow:hidden`
  inline-styled frame, else they collapse to 0 height → floor card.
- **In-view components** (Reveal, CountUp, anything `whileInView`/`useInView`):
  center the content in a tall frame (inline `minHeight ~320, flex center`) so
  the observer fires; the harness reduced-motion patch then settles them.
- The dark theme surface (`VibeCurveTheme`, cfg.provider) is applied
  automatically — don't re-wrap.

## Re-build / re-sync recipe (this repo)
1. Regenerate the Tailwind CSS (scans app + components + previews):
   `npx tailwindcss -c tailwind.config.ts --content "./app/**/*.{js,ts,jsx,tsx,mdx},./components/**/*.{js,ts,jsx,tsx,mdx},./.design-sync/previews/**/*.tsx" -i .design-sync/assets/ds-input.css -o .design-sync/assets/ds-styles.css`
2. Re-apply the two harness patches above to the freshly-staged `.ds-sync/`.
3. Converter / driver: `--entry .design-sync/ds-entry.tsx --node-modules ./node_modules`.

## Re-sync risks (watch list)
- **The two harness patches are LOST on every re-stage** (`cp -r` from the
  bundled skill overwrites `.ds-sync/package-capture.mjs` and
  `package-validate.mjs`). Without them, every `whileInView`/`useInView`/counter
  preview captures blank and grades fail spuriously. Re-apply them (see
  "Capturing / rendering" above) before any capture/validate on a fresh stage.
- **Tailwind CSS is generated, not committed-as-truth.** If you forget step 1,
  newly-used utility classes (in components OR previews) will be missing from
  `styles.css` and those render unstyled. Always regenerate before the build.
- **Barrel ↔ componentSrcMap drift**: a component added to the repo won't sync
  until it's added to BOTH `.design-sync/ds-entry.tsx` and `cfg.componentSrcMap`.
- **Fonts load remotely** (Google `@import`). If the headless render machine has
  no network, previews fall back to system fonts (esp. the serif display). If
  fidelity suffers, self-host the woff2 via `cfg.extraFonts`.
- App-coupled components (`AuthButton`, scenes reading session/router) only
  render their default/unauthenticated branch via the shims.
