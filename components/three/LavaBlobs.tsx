"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Liquid lava-lamp blobs via a full-screen metaball shader. Each blob drifts on
// its own slow path; their gaussian fields sum, so where blobs get close they
// fuse into gooey shapes and split apart again. Colors blend in the merge zones.
// Full-bleed (no object to frame) → looks right on every screen, phones included.
// Transparent outside the blobs, so the page's soft aurora shows through the gaps.

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen, camera-independent
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  vec3 palette(float i) {
    float k = mod(i, 5.0);
    if (k < 0.5) return vec3(0.545, 0.361, 0.965); // violet
    if (k < 1.5) return vec3(0.925, 0.286, 0.600); // pink
    if (k < 2.5) return vec3(0.220, 0.740, 0.970); // sky
    if (k < 3.5) return vec3(0.992, 0.729, 0.455); // peach
    return vec3(0.655, 0.545, 0.980);              // light violet
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;

    float field = 0.0;
    vec3 colAccum = vec3(0.0);
    const int N = 8;
    for (int i = 0; i < N; i++) {
      float fi = float(i);
      vec2 c = vec2(
        0.5 + 0.36 * sin(uTime * (0.18 + 0.045 * fi) + fi * 1.7),
        0.5 + 0.34 * cos(uTime * (0.16 + 0.038 * fi) + fi * 2.3)
      );
      c.x *= uAspect;
      float r = 0.20 + 0.06 * sin(fi * 1.3 + uTime * 0.25);
      vec2 d = uv - c;
      float contrib = exp(-dot(d, d) / (r * r)); // gaussian → localized, fuses when close
      field += contrib;
      colAccum += palette(fi) * contrib;
    }

    vec3 col = colAccum / max(field, 0.0001);
    col += smoothstep(0.9, 1.8, field) * 0.10; // cores pop a touch
    float alpha = smoothstep(0.32, 0.72, field);
    float glow = smoothstep(0.12, 0.32, field) * 0.30; // soft gooey halo
    alpha = clamp(alpha + glow, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

function Blobs() {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAspect: { value: 1 } }),
    [],
  );

  useFrame((state, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
    uniforms.uAspect.value = state.size.width / Math.max(1, state.size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function LavaBlobs({ className = "" }: { className?: string }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <Blobs />
    </Canvas>
  );
}
