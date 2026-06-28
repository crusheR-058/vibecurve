"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { pointer, useJourney } from "@/lib/journeyStore";
import { PALETTES } from "@/lib/worlds";

// One persistent 3D universe for the whole journey. Scroll progress morphs the
// curve + particle palette along PALETTES (brand → each world) and rides the
// camera; the worlds never cut, they dissolve into one another.

const CURVE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const GRAD = /* glsl */ `
  vec3 grad(float t){ return t < 0.5 ? mix(uA, uB, t * 2.0) : mix(uB, uC, (t - 0.5) * 2.0); }
`;
const CURVE_FRAG_CORE = /* glsl */ `
  uniform float uReveal; uniform float uTime; uniform vec3 uA, uB, uC;
  varying vec2 vUv;
  ${GRAD}
  void main(){
    if (vUv.x > uReveal) discard;
    vec3 col = grad(vUv.x);
    col += smoothstep(uReveal - 0.05, uReveal, vUv.x) * 1.3;
    gl_FragColor = vec4(col, 0.95);
  }
`;
const CURVE_FRAG_GLOW = /* glsl */ `
  uniform float uReveal; uniform float uTime; uniform vec3 uA, uB, uC;
  varying vec2 vUv;
  ${GRAD}
  void main(){
    if (vUv.x > uReveal) discard;
    vec3 col = grad(vUv.x);
    float pulse = 0.6 + 0.4 * sin(uTime * 1.5 - vUv.x * 22.0);
    gl_FragColor = vec4(col, 0.15 * pulse);
  }
`;
const P_VERT = /* glsl */ `
  uniform float uTime;
  varying float vTw;
  void main(){
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
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * (0.2 + 0.6 * vTw));
  }
`;

function Scene() {
  const particles = useRef<THREE.Group>(null);
  const reveal = useRef({ v: 0 });
  const { camera } = useThree();

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
        uA: { value: new THREE.Color() },
        uB: { value: new THREE.Color() },
        uC: { value: new THREE.Color() },
      },
      vertexShader: CURVE_VERT,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const coreMat = useMemo(() => make(CURVE_FRAG_CORE), []);
  const glowMat = useMemo(() => make(CURVE_FRAG_GLOW), []);

  const count = typeof window !== "undefined" && window.innerWidth < 768 ? 1800 : 3600;
  const { positions, pMat } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const pMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#b3a4ff") } },
      vertexShader: P_VERT,
      fragmentShader: P_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { positions, pMat };
  }, [count]);

  const pal = useMemo(() => PALETTES.map((p) => p.map((c) => new THREE.Color(c))), []);
  const tmp = useMemo(() => [new THREE.Color(), new THREE.Color(), new THREE.Color()], []);

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
    const prog = useJourney.getState().progress;
    // morph palette along the path — front-loaded so colour tracks the visible
    // world (the last world lands ~85% down, before the CTA/footer)
    const t = Math.min(prog * 9.8, pal.length - 1.001);
    const i = Math.min(Math.floor(t), pal.length - 2);
    const f = t - i;
    tmp[0].lerpColors(pal[i][0], pal[i + 1][0], f);
    tmp[1].lerpColors(pal[i][1], pal[i + 1][1], f);
    tmp[2].lerpColors(pal[i][2], pal[i + 1][2], f);
    for (const m of [coreMat, glowMat]) {
      m.uniforms.uReveal.value = reveal.current.v;
      m.uniforms.uTime.value += dt;
      (m.uniforms.uA.value as THREE.Color).copy(tmp[0]);
      (m.uniforms.uB.value as THREE.Color).copy(tmp[1]);
      (m.uniforms.uC.value as THREE.Color).copy(tmp[2]);
    }
    pMat.uniforms.uTime.value += dt;
    (pMat.uniforms.uColor.value as THREE.Color).copy(tmp[1]);

    const g = particles.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.1 + prog * 0.5, 0.04);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.06, 0.04);
    }

    // ride the curve: gentle pan + parallax + breathing dolly
    const camX = (prog - 0.5) * 3 + pointer.x * 0.8;
    const camY = pointer.y * 0.5 + (prog - 0.5) * 0.7;
    const camZ = 8.6 - Math.sin(prog * Math.PI) * 1.1;
    camera.position.x += (camX - camera.position.x) * 0.045;
    camera.position.y += (camY - camera.position.y) * 0.045;
    camera.position.z += (camZ - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={particles}>
        <points material={pMat}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
        </points>
      </group>
      <mesh geometry={glowGeo} material={glowMat} />
      <mesh geometry={coreGeo} material={coreMat} />
    </>
  );
}

export default function JourneyCanvas() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9], fov: 50 }}
    >
      <color attach="background" args={["#07060c"]} />
      <fog attach="fog" args={["#07060c", 9, 24]} />
      <Scene />
    </Canvas>
  );
}
