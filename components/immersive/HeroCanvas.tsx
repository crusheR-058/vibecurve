"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { pointer, useJourney } from "@/lib/journeyStore";

const COL_A = "#38bdf8"; // sky
const COL_B = "#8b5cf6"; // violet
const COL_C = "#fb7185"; // rose

// ── the glowing curve ───────────────────────────────────────────────────────
const CURVE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv; // TubeGeometry: uv.x runs along the length, uv.y around
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gradient = /* glsl */ `
  vec3 grad(float t) {
    return t < 0.5 ? mix(uA, uB, t * 2.0) : mix(uB, uC, (t - 0.5) * 2.0);
  }
`;

const CURVE_FRAG_CORE = /* glsl */ `
  uniform float uReveal; uniform float uTime;
  uniform vec3 uA, uB, uC;
  varying vec2 vUv;
  ${gradient}
  void main() {
    if (vUv.x > uReveal) discard;
    vec3 col = grad(vUv.x);
    float head = smoothstep(uReveal - 0.05, uReveal, vUv.x); // bright comet head
    col += head * 1.3;
    gl_FragColor = vec4(col, 0.95);
  }
`;

const CURVE_FRAG_GLOW = /* glsl */ `
  uniform float uReveal; uniform float uTime;
  uniform vec3 uA, uB, uC;
  varying vec2 vUv;
  ${gradient}
  void main() {
    if (vUv.x > uReveal) discard;
    vec3 col = grad(vUv.x);
    float pulse = 0.6 + 0.4 * sin(uTime * 1.5 - vUv.x * 22.0);
    gl_FragColor = vec4(col, 0.15 * pulse);
  }
`;

function GlowCurve() {
  const reveal = useRef({ v: 0 });

  const { coreGeo, glowGeo } = useMemo(() => {
    const pts = [
      new THREE.Vector3(-7.2, -1.4, -2),
      new THREE.Vector3(-3.6, 1.7, 0.4),
      new THREE.Vector3(0, -1.3, 1.6),
      new THREE.Vector3(3.7, 1.9, 0.2),
      new THREE.Vector3(7.2, -0.5, -2),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return {
      coreGeo: new THREE.TubeGeometry(curve, 260, 0.05, 12, false),
      glowGeo: new THREE.TubeGeometry(curve, 260, 0.26, 14, false),
    };
  }, []);

  const make = (frag: string) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uReveal: { value: 0 },
        uTime: { value: 0 },
        uA: { value: new THREE.Color(COL_A) },
        uB: { value: new THREE.Color(COL_B) },
        uC: { value: new THREE.Color(COL_C) },
      },
      vertexShader: CURVE_VERT,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

  const coreMat = useMemo(() => make(CURVE_FRAG_CORE), []);
  const glowMat = useMemo(() => make(CURVE_FRAG_GLOW), []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      reveal.current.v = 1;
      return;
    }
    const tw = gsap.to(reveal.current, { v: 1, duration: 2.8, ease: "power2.inOut", delay: 0.4 });
    return () => {
      tw.kill();
    };
  }, []);

  useFrame((_, dt) => {
    const v = reveal.current.v;
    coreMat.uniforms.uReveal.value = v;
    glowMat.uniforms.uReveal.value = v;
    coreMat.uniforms.uTime.value += dt;
    glowMat.uniforms.uTime.value += dt;
  });

  return (
    <group>
      <mesh geometry={glowGeo} material={glowMat} />
      <mesh geometry={coreGeo} material={coreMat} />
    </group>
  );
}

// ── particle dust ───────────────────────────────────────────────────────────
const P_VERT = /* glsl */ `
  uniform float uTime;
  varying float vTw;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.3 + p.x * 0.5) * 0.18;
    vTw = 0.5 + 0.5 * sin(uTime * 1.4 + p.x * 3.0 + p.y * 2.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (20.0 / -mv.z) * (0.5 + 0.7 * vTw);
    gl_Position = projectionMatrix * mv;
  }
`;

const P_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * (0.2 + 0.6 * vTw);
    gl_FragColor = vec4(uColor, a);
  }
`;

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, mat } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#b3a4ff") } },
      vertexShader: P_VERT,
      fragmentShader: P_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { positions, mat };
  }, [count]);

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt;
    const g = ref.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.12, 0.04);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.08, 0.04);
  });

  return (
    <points ref={ref} material={mat}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}

// ── camera: mouse parallax + scroll dolly ───────────────────────────────────
function Rig() {
  const { camera } = useThree();
  useFrame(() => {
    const p = useJourney.getState().progress;
    const tx = pointer.x * 0.9;
    const ty = pointer.y * 0.55;
    camera.position.x += (tx - camera.position.x) * 0.045;
    camera.position.y += (ty - camera.position.y) * 0.045;
    camera.position.z += (9 - p * 4 - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroCanvas() {
  // lighter particle load on phones
  const count = typeof window !== "undefined" && window.innerWidth < 768 ? 1800 : 3600;
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9], fov: 50 }}
    >
      <color attach="background" args={["#07060c"]} />
      <fog attach="fog" args={["#07060c", 9, 22]} />
      <Particles count={count} />
      <GlowCurve />
      <Rig />
    </Canvas>
  );
}
