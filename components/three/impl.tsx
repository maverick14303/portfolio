"use client";

/**
 * All three.js-heavy code lives in this one module so it ships as a single
 * lazy chunk, and every 3D element renders through ONE shared WebGL context:
 * a fixed <Canvas> with <View.Port>, plus drei <View>s tracked to DOM rects
 * (full-viewport background + each photo card). One context = no
 * context-loss fights and reel-style photo/scene compositing.
 */

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { View, PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------ background ------------------------------ */

const WAVE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  varying float vH;
  varying float vDepth;

  void main() {
    vec3 pos = position;
    float t = uTime * 0.55;
    float h =
      sin(pos.x * 0.55 + t) * 0.42 +
      cos(pos.y * 0.48 - t * 0.8) * 0.38 +
      sin((pos.x + pos.y) * 0.3 + t * 0.6) * 0.3;
    h *= 1.0 + uScroll * 0.35;
    pos.z += h;
    vH = h;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = 42.0 / -mv.z;
  }
`;

const WAVE_FRAG = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  varying float vH;
  varying float vDepth;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;
    float glow = smoothstep(0.5, 0.1, length(c));
    float lift = smoothstep(-0.9, 1.1, vH);
    vec3 col = mix(uColorLow, uColorHigh, lift);
    float fade = smoothstep(26.0, 9.0, vDepth);
    gl_FragColor = vec4(col, glow * (0.10 + lift * 0.35) * fade);
  }
`;

function WaveGrid({ compact }: { compact: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const cols = compact ? 70 : 110;
    const rows = compact ? 44 : 64;
    const w = 30;
    const d = 18;
    const positions = new Float32Array(cols * rows * 3);
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        positions[i++] = (x / (cols - 1) - 0.5) * w;
        positions[i++] = (y / (rows - 1) - 0.5) * d;
        positions[i++] = 0;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [compact]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uColorLow: { value: new THREE.Color("#12202e") },
      uColorHigh: { value: new THREE.Color("#6ee7f2") },
    }),
    []
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    const denom = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = Math.min(1, window.scrollY / denom);
    const u = mat.current.uniforms.uScroll;
    u.value += (p - u.value) * 0.05;
  });

  return (
    <points geometry={geometry} rotation={[-Math.PI / 2.35, 0, 0]} position={[0, -4.6, -6]}>
      <shaderMaterial
        ref={mat}
        vertexShader={WAVE_VERT}
        fragmentShader={WAVE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Shape({
  geo,
  color,
  base,
  drift,
  speed,
  opacity,
}: {
  geo: THREE.BufferGeometry;
  color: string;
  base: [number, number, number];
  drift: number;
  speed: number;
  opacity: number;
}) {
  const ref = useRef<THREE.LineSegments>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * speed * 0.4;
    ref.current.rotation.y = t * speed;
    ref.current.position.y = base[1] + Math.sin(t * 0.4 + drift) * 0.5;
    const denom = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = window.scrollY / denom;
    ref.current.position.x = base[0] + Math.sin(p * Math.PI * 2 + drift) * 0.8;
  });

  return (
    <lineSegments ref={ref} geometry={edges} position={base}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

function Rig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const denom = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = Math.min(1, window.scrollY / denom);
    const tx = mouse.current.x * 0.55;
    const ty = -mouse.current.y * 0.35 - p * 1.6;
    camera.position.x += (tx - camera.position.x) * 0.04;
    camera.position.y += (ty - camera.position.y) * 0.04;
    camera.lookAt(0, -p * 1.4, -6);
  });

  return null;
}

function BackgroundScene({ compact }: { compact: boolean }) {
  const ico = useMemo(() => new THREE.IcosahedronGeometry(1.5, 0), []);
  const torus = useMemo(() => new THREE.TorusGeometry(1.1, 0.42, 8, 20), []);
  const octa = useMemo(() => new THREE.OctahedronGeometry(0.9, 0), []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={42} />
      <Rig />
      <WaveGrid compact={compact} />
      <Shape geo={ico} color="#6ee7f2" base={[8.2, 3.1, -8]} drift={0} speed={0.1} opacity={0.3} />
      <Shape geo={torus} color="#f2b263" base={[-9.6, 3.4, -10]} drift={2.1} speed={0.07} opacity={0.2} />
      {!compact && (
        <Shape geo={octa} color="#6ee7f2" base={[9.4, -4.2, -7]} drift={4.2} speed={0.14} opacity={0.18} />
      )}
    </>
  );
}

export function BackgroundViewImpl({ compact }: { compact: boolean }) {
  return (
    <View aria-hidden className="pointer-events-none fixed inset-0">
      <BackgroundScene compact={compact} />
    </View>
  );
}

/* ------------------------------ photo view ------------------------------ */

const PHOTO_CAM = { z: 2.6, fov: 50 };

const PHOTO_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin((uv.x + uv.y) * 6.0 + uTime * 0.8) * 0.008;
    float d = distance(uv, uPointer);
    float wave = sin(d * 26.0 - uTime * 5.0) * exp(-d * 5.5) * uHover;
    pos.z += wave * 0.06;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const PHOTO_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uHover;
  uniform vec2 uCover;   // texture "cover" fit
  uniform vec2 uRadius;  // corner radius, in uv units per axis
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    vec2 shift = vec2(vWave * 0.012 + uHover * 0.0035, 0.0);
    float r = texture2D(uTex, uv + shift).r;
    vec2 gb = vec2(texture2D(uTex, uv).g, texture2D(uTex, uv - shift).b);
    vec3 col = vec3(r, gb);
    float vig = smoothstep(0.92, 0.55, distance(vUv, vec2(0.5)));
    col *= 0.8 + vig * 0.28;

    // rounded-rect alpha so the plane matches its CSS frame
    vec2 p = abs(vUv - 0.5) - (vec2(0.5) - uRadius);
    vec2 q = max(p, 0.0) / max(uRadius, vec2(0.0001));
    float d = length(q);
    float alpha = 1.0 - smoothstep(0.96, 1.02, d);

    gl_FragColor = vec4(col, alpha);
  }
`;

function PhotoPlane({ src, aspect }: { src: string; aspect: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, src);
  const hover = useRef(0);
  const pointer = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uPointer: { value: pointer.current },
      uCover: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: new THREE.Vector2(0.04, 0.04) },
    }),
    [texture]
  );

  // Plane exactly fills the view, so its edges line up with the DOM frame.
  // Derived from this View's own camera (PHOTO_CAM) — useThree().viewport is
  // resolved against the root canvas camera and would over-size the plane.
  const h = 2 * Math.tan(((PHOTO_CAM.fov / 2) * Math.PI) / 180) * PHOTO_CAM.z;
  const w = h * (size.width / Math.max(1, size.height));

  useEffect(() => {
    if (!mat.current) return;
    // "cover" fit: sample a sub-region of the texture, never squash it
    const planeAspect = w / h;
    const cover = mat.current.uniforms.uCover.value as THREE.Vector2;
    if (planeAspect > aspect) cover.set(1, aspect / planeAspect);
    else cover.set(planeAspect / aspect, 1);
    // 12px CSS corner radius (rounded-xl) expressed in uv
    const radius = mat.current.uniforms.uRadius.value as THREE.Vector2;
    radius.set(12 / Math.max(1, size.width), 12 / Math.max(1, size.height));
  }, [w, h, aspect, size.width, size.height]);

  useFrame((state, delta) => {
    if (!mat.current || !mesh.current) return;
    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uHover.value += (hover.current - u.uHover.value) * Math.min(1, delta * 6);
    // tilt happens in 3D (the DOM frame stays axis-aligned so the canvas
    // scissor rect and the frame never drift apart)
    const tx = hover.current > 0 ? -(pointer.current.y - 0.5) * 0.22 : 0;
    const ty = hover.current > 0 ? (pointer.current.x - 0.5) * 0.28 : 0;
    mesh.current.rotation.x += (tx - mesh.current.rotation.x) * Math.min(1, delta * 5);
    mesh.current.rotation.y += (ty - mesh.current.rotation.y) * Math.min(1, delta * 5);
  });

  return (
    <mesh
      ref={mesh}
      onPointerMove={(e) => {
        if (e.uv) pointer.current.set(e.uv.x, e.uv.y);
        hover.current = 1;
      }}
      onPointerDown={(e) => {
        if (e.uv) pointer.current.set(e.uv.x, e.uv.y);
        hover.current = 1;
      }}
      onPointerLeave={() => {
        hover.current = 0;
      }}
    >
      <planeGeometry args={[w, h, 48, 48]} />
      <shaderMaterial
        ref={mat}
        vertexShader={PHOTO_VERT}
        fragmentShader={PHOTO_FRAG}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export function PhotoViewImpl({ src, aspect }: { src: string; aspect: number }) {
  return (
    <View className="absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0, PHOTO_CAM.z]} fov={PHOTO_CAM.fov} />
      <Suspense fallback={null}>
        <PhotoPlane src={src} aspect={aspect} />
      </Suspense>
    </View>
  );
}

/* ------------------------------ root canvas ------------------------------ */

export function GlobalCanvasImpl({ compact }: { compact: boolean }) {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setEventSource(document.body);
  }, []);

  if (!eventSource) return null;

  return (
    <Canvas
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      eventSource={eventSource}
      eventPrefix="client"
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <View.Port />
    </Canvas>
  );
}

/* ------------------------------ hero model ------------------------------ */

/**
 * The exported core.glb (see scripts/make-model.mjs), floating beside the
 * hero. Rotates slowly, drifts with the pointer, and lifts on scroll.
 */
function CoreModel() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/core.glb");
  const mouse = useRef({ x: 0, y: 0 });

  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.22;
    group.current.rotation.x = Math.sin(t * 0.3) * 0.12 + mouse.current.y * 0.16;
    group.current.rotation.z = mouse.current.x * 0.1;
    group.current.position.y = Math.sin(t * 0.6) * 0.09;
  });

  return (
    <group ref={group} scale={1.25}>
      <primitive object={cloned} />
    </group>
  );
}

export function CoreViewImpl() {
  return (
    <View className="absolute inset-0">
      <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={45} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#eaf6ff" />
      <pointLight position={[-3, -2, 2]} intensity={7} color="#6ee7f2" distance={12} />
      <pointLight position={[2, -1, -2]} intensity={5} color="#f2b263" distance={10} />
      <Suspense fallback={null}>
        <CoreModel />
      </Suspense>
    </View>
  );
}

useGLTF.preload("/models/core.glb");
