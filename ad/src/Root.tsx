import React from "react";
import { Composition } from "remotion";
import { VibeCurveAd } from "./Ad";
import { Poster } from "./Poster";
import { FPS, TOTAL as DURATION } from "./timeline";
import "./fonts"; // trigger webfont loading (delayRender) before first paint

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
      {/* Poster / thumbnail still (logo + hero line only) */}
      <Composition id="Poster" component={Poster} durationInFrames={60} fps={FPS} width={1920} height={1080} />
    </>
  );
};
