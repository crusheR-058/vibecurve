import React from "react";
import { Composition } from "remotion";
import { VibeCurveAd } from "./Ad";
import "./fonts"; // trigger webfont loading (delayRender) before first paint

const FPS = 30;
const DURATION = 900; // 30.0s — see Ad.tsx for the per-scene budget

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 master — landing page / YouTube / X */}
      <Composition
        id="VibeCurveAd"
        component={VibeCurveAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/* 9:16 cut — Reels / TikTok / Shorts (same scenes, adaptive layout) */}
      <Composition
        id="VibeCurveAdVertical"
        component={VibeCurveAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
