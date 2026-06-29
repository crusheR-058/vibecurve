import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Intro } from "./scenes/Intro";
import { Hook } from "./scenes/Hook";
import { Flashcards } from "./scenes/Flashcards";
import { DrawDay } from "./scenes/DrawDay";
import { Match } from "./scenes/Match";
import { Rooms } from "./scenes/Rooms";
import { Warmth } from "./scenes/Warmth";
import { Plus } from "./scenes/Plus";
import { Burn } from "./scenes/Burn";
import { CTA } from "./scenes/CTA";
import { Soundtrack } from "./Soundtrack";
import { SCENE_DURATIONS, XFADE } from "./timeline";
import { COLORS } from "./theme";

const SCENES = [<Intro />, <Hook />, <Flashcards />, <DrawDay />, <Match />, <Rooms />, <Warmth />, <Plus />, <Burn />, <CTA />];

/**
 * The 90-second VibeCurve ad:
 * intro → hook → build your profile (flashcards) → draw your day → match →
 * anonymous rooms → the warmth economy → VibeCurve+ → midnight burn → CTA.
 *
 * Children are pushed into a flat array (not a fragment map) so TransitionSeries
 * sees Sequence/Transition nodes directly.
 */
export const VibeCurveAd: React.FC = () => {
  const timing = () => linearTiming({ durationInFrames: XFADE });
  const children: React.ReactNode[] = [];
  SCENES.forEach((node, i) => {
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SCENE_DURATIONS[i]}>
        {node}
      </TransitionSeries.Sequence>
    );
    if (i < SCENES.length - 1) {
      children.push(<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={timing()} />);
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TransitionSeries>{children}</TransitionSeries>
      <Soundtrack />
    </AbsoluteFill>
  );
};
