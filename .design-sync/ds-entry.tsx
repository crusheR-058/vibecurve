// design-sync bundle entry for VibeCurve.
//
// Why this file exists: VibeCurve is a Next.js app, not a published component
// library, and nearly every component is a `export default`. The converter's
// synth-entry (`export *`) drops default exports, so we author an explicit
// barrel of NAMED re-exports here and point the build at it via --entry. Every
// component listed in cfg.componentSrcMap must be re-exported below so it lands
// on window.VibeCurve.<Name>. Keep this list in sync with componentSrcMap.

// Must be first: defines process.env before any component module body runs.
import "./shims/provide-process";
import * as React from "react";

// ── Preview theme surface (cfg.provider) ─────────────────────────────────────
// VibeCurve is dark by default (the app adds `.dark` to <html> pre-paint). The
// preview card paints a white body with no theme class, which would render the
// dark-forward brand in light mode on white. This wrapper re-establishes the
// brand's default: the `.dark` token set + the canvas background + base font.
// It is NOT a real app provider (the app uses SessionProvider + MotionConfig) —
// it only gives every preview the brand's signature dark surface. Not listed in
// componentSrcMap, so it ships in the bundle without a component card.
export function VibeCurveTheme({ children }: { children?: React.ReactNode }) {
  return React.createElement(
    "div",
    {
      className: "dark",
      style: {
        minHeight: "100%",
        background: "rgb(var(--canvas))",
        color: "rgb(var(--ink))",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      },
    },
    children
  );
}

// ── UI primitives ────────────────────────────────────────────────────────────
export { default as AnimatedWave } from "@/components/ui/AnimatedWave";
export { default as Aurora } from "@/components/ui/Aurora";
export { default as AuthButton } from "@/components/ui/AuthButton";
export { default as CountUp } from "@/components/ui/CountUp";
export { default as CountdownRing } from "@/components/ui/CountdownRing";
export { default as CursorGlow } from "@/components/ui/CursorGlow";
export { default as FloatingParticles } from "@/components/ui/FloatingParticles";
export { default as Logo } from "@/components/ui/Logo";
export { default as MagneticButton } from "@/components/ui/MagneticButton";
export { default as Marquee } from "@/components/ui/Marquee";
export { default as Reveal } from "@/components/ui/Reveal";
export { default as ScrollProgress } from "@/components/ui/ScrollProgress";
export { default as ThemeToggle } from "@/components/ui/ThemeToggle";
export { default as TiltCard } from "@/components/ui/TiltCard";
export { default as VibrantAurora } from "@/components/ui/VibrantAurora";
export { Toaster, toast } from "@/components/ui/Toast";

// ── Immersive / journey ──────────────────────────────────────────────────────
export { default as Cursor } from "@/components/immersive/Cursor";
export { default as HeroCanvas } from "@/components/immersive/HeroCanvas";
export { default as HeroWorld } from "@/components/immersive/HeroWorld";
export { default as ImmersiveJourney } from "@/components/immersive/ImmersiveJourney";
export { default as ImmersiveNav } from "@/components/immersive/ImmersiveNav";
export { default as JourneyCanvas } from "@/components/immersive/JourneyCanvas";
export { default as Loader } from "@/components/immersive/Loader";
export { default as SmoothScroll } from "@/components/immersive/SmoothScroll";
export { default as WorldSection } from "@/components/immersive/WorldSection";

// ── Landing ──────────────────────────────────────────────────────────────────
// FAQ is all-caps, which the converter's name filter rejects as a constant —
// re-export it under a PascalCase identifier so it ships as a component.
export { default as Faq } from "@/components/landing/FAQ";
export { default as Footer } from "@/components/landing/Footer";
export { default as Nav } from "@/components/landing/Nav";

// ── Room ─────────────────────────────────────────────────────────────────────
export { default as GroupCall } from "@/components/room/GroupCall";
export { default as MediaTray } from "@/components/room/MediaTray";
export { default as StickerArt } from "@/components/room/StickerArt";
export { default as VoicePlayer } from "@/components/room/VoicePlayer";

// ── Scenes (full-screen compositions) ────────────────────────────────────────
export { default as DrawYourDay } from "@/components/scenes/DrawYourDay";
export { default as Login } from "@/components/scenes/Login";
export { default as Matching } from "@/components/scenes/Matching";
export { default as MidnightBurn } from "@/components/scenes/MidnightBurn";
export { default as Onboarding } from "@/components/scenes/Onboarding";
export { default as ParallelRoom } from "@/components/scenes/ParallelRoom";
export { default as ProfileDashboard } from "@/components/scenes/ProfileDashboard";
export { default as VibeCheckHome } from "@/components/scenes/VibeCheckHome";
export { default as Walkthrough } from "@/components/scenes/Walkthrough";
