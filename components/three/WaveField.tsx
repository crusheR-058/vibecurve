"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// A field of points displaced by layered sine waves in the vertex shader — a
// living 3D "sea of day-curves". All motion runs on the GPU, so it stays smooth
// even at ~12k points. Brand-graded by height: violet troughs → peach crests.

const VERT = /* glsl */ `
  uniform float uTime;
  varying float vH;
  void main() {
    vec3 p = position;
    float h =
        sin(p.x * 0.55 + uTime * 0.70) * 0.60
      + sin(p.y * 0.50 - uTime * 0.50) * 0.60
      + sin((p.x + p.y) * 0.30 + uTime * 0.90) * 0.35
      + sin(length(p.xy) * 0.60 - uTime * 1.10) * 0.30;
    p.z += h;
    vH = h;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (95.0 / -mv.z) * (0.55 + 0.45 * smoothstep(-1.5, 1.5, h));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uLow;
  uniform vec3 uMid;
  uniform vec3 uHigh;
  uniform float uOpacity;
  varying float vH;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float t = smoothstep(-1.4, 1.4, vH);
    vec3 col = t < 0.5 ? mix(uLow, uMid, t * 2.0) : mix(uMid, uHigh, (t - 0.5) * 2.0);
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;

function Field() {
  const group = useRef<THREE.Group>(null);
  const N = 110;
  const S = 6.5;

  const positions = useMemo(() => {
    const a = new Float32Array(N * N * 3);
    let k = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        a[k++] = (i / (N - 1) - 0.5) * 2 * S;
        a[k++] = (j / (N - 1) - 0.5) * 2 * S;
        a[k++] = 0;
      }
    }
    return a;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLow: { value: new THREE.Color("#8b5cf6") },
      uMid: { value: new THREE.Color("#a78bfa") },
      uHigh: { value: new THREE.Color("#fdba74") },
      uOpacity: { value: 0.92 },
    }),
    [],
  );

  useFrame((state, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
    const g = group.current;
    if (!g) return;
    // gentle mouse parallax + slow drift
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -1.05 + state.pointer.y * 0.12, 0.04);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, state.pointer.x * 0.16, 0.04);
    g.rotation.y += dt * 0.02;
  });

  return (
    <group ref={group} rotation={[-1.05, 0, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

export default function WaveField({ className = "" }: { className?: string }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.6, 8], fov: 45 }}
    >
      <Field />
    </Canvas>
  );
}
