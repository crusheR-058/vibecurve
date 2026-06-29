import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Intro } from "./scenes/Intro";
import { Hook } from "./scenes/Hook";
import { DrawDay } from "./scenes/DrawDay";
import { Match } from "./scenes/Match";
import { Rooms } from "./scenes/Rooms";
import { Burn } from "./scenes/Burn";
import { Soundtrack } from "./Soundtrack";
import { COLORS } from "./theme";

const XFADE = 18;
const timing = () => linearTiming({ durationInFrames: XFADE });

/**
 * The 30-second VibeCurve ad: intro → hook → draw your day → match → rooms →
 * midnight burn + CTA, stitched with soft cross-fades.
 *
 * Scene frames sum to 990; five 18-frame fades overlap, so the timeline lands
 * at 900 frames = 30.0s @ 30fps. Keep `durationInFrames` in Root.tsx in sync.
 */
export const VibeCurveAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing()} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing()} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <DrawDay />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing()} />

        <TransitionSeries.Sequence durationInFrames={170}>
          <Match />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing()} />

        <TransitionSeries.Sequence durationInFrames={170}>
          <Rooms />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing()} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <Burn />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Soundtrack />
    </AbsoluteFill>
  );
};
