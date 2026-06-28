"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Calm 3D depth: translucent brand-tinted orbs drifting at varied distances,
// with a soft pointer parallax. Mounted only while its section is in view.

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#fdba74"];

interface OrbData {
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  op: number;
  spd: number;
  phase: number;
  amp: number;
}

function Orb({ d }: { d: OrbData }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = ref.current;
    if (!m) return;
    m.position.y = d.y + Math.sin(t * d.spd + d.phase) * d.amp;
    m.position.x = d.x + Math.cos(t * d.spd * 0.7 + d.phase) * d.amp * 0.6;
  });
  return (
    <mesh ref={ref} position={[d.x, d.y, d.z]}>
      <sphereGeometry args={[d.r, 24, 24]} />
      <meshBasicMaterial color={d.color} transparent opacity={d.op} />
    </mesh>
  );
}

function Cluster() {
  const group = useRef<THREE.Group>(null);
  const orbs = useMemo<OrbData[]>(() => {
    // deterministic scatter (no Math.random → stable across renders)
    const out: OrbData[] = [];
    const COUNT = 20;
    for (let i = 0; i < COUNT; i++) {
      const a = i * 2.39996; // golden angle
      const rad = 1.6 + (i % 5) * 1.2;
      out.push({
        x: Math.cos(a) * rad,
        y: Math.sin(a * 1.3) * 2.4,
        z: -2 - (i % 6),
        r: 0.22 + ((i * 37) % 70) / 100,
        color: COLORS[i % COLORS.length],
        op: 0.28 + ((i * 13) % 30) / 100,
        spd: 0.3 + ((i * 7) % 40) / 100,
        phase: a,
        amp: 0.3 + ((i * 17) % 50) / 100,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.3, 0.03);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.2, 0.03);
  });

  return (
    <group ref={group}>
      {orbs.map((d, i) => (
        <Orb key={i} d={d} />
      ))}
    </group>
  );
}

export default function FloatingOrbs({ className = "" }: { className?: string }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 9], fov: 50 }}
    >
      <Cluster />
    </Canvas>
  );
}
