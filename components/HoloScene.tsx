"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/* ─── Holographic floor grid ──────────────────────────────────────────────── */
const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  uniform float uTime;
  uniform vec3  uColor;
  varying vec2  vUv;

  float line(float v, float w) {
    return 1.0 - smoothstep(0.0, w, abs(fract(v - 0.5) - 0.5));
  }

  void main() {
    vec2 g1 = vUv * 22.0;
    float gA = max(line(g1.x, 0.04), line(g1.y - uTime * 0.13, 0.04));

    vec2 g2 = vUv * 110.0;
    float gB = max(line(g2.x, 0.03), line(g2.y - uTime * 0.65, 0.03)) * 0.28;

    float grid = max(gA, gB);

    float horizonFade = smoothstep(0.0, 0.6, vUv.y);
    float edgeFade    = 1.0 - smoothstep(0.28, 0.50, abs(vUv.x - 0.5));
    float fade        = horizonFade * edgeFade;

    float scanY  = mod(uTime * 0.28, 1.0);
    float scan   = 1.0 - smoothstep(0.0, 0.018, abs(vUv.y - scanY));

    float alpha = (grid * 0.75 + scan * 0.45) * fade;
    vec3  col   = uColor * (1.0 + gA * 2.0 + scan * 2.5);

    gl_FragColor = vec4(col, alpha);
  }
`;

function HoloGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color(0x00DFFB) },
  }), []);

  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -6]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        args={[{ uniforms, vertexShader: VERT, fragmentShader: FRAG }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ─── Floating data particles ─────────────────────────────────────────────── */
function Particles({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = Math.random() * 14 - 3;
      positions[i * 3 + 2] = Math.random() * -28 - 1;
      speeds[i]             = 0.003 + Math.random() * 0.007;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 11) {
        arr[i * 3 + 1] = -3;
        arr[i * 3]     = (Math.random() - 0.5) * 32;
        arr[i * 3 + 2] = Math.random() * -28 - 1;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00DFFB"
        size={0.05}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Orbital holographic rings ───────────────────────────────────────────── */
function Ring({
  radius, speed, tiltX, tiltZ, color, opacity, z,
}: {
  radius: number; speed: number; tiltX: number; tiltZ: number;
  color: string; opacity: number; z: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]} position={[0, 1.5, z]}>
      <torusGeometry args={[radius, 0.022, 8, 120]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Vertical data pillars (HUD columns of light) ────────────────────────── */
function DataPillars() {
  const pillars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 24,
      z: -6 - Math.random() * 16,
      h: 2 + Math.random() * 6,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    })), []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    pillars.forEach((p, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const t = clock.elapsedTime * p.speed + p.phase;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (Math.sin(t) * 0.5 + 0.5) * 0.12;
    });
  });

  return (
    <>
      {pillars.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[p.x, p.h / 2 - 2, p.z]}
        >
          <cylinderGeometry args={[0.012, 0.012, p.h, 4]} />
          <meshBasicMaterial
            color="#52FEFE"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─── Scene root ──────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <fog attach="fog" args={["#000308", 22, 48]} />
      <ambientLight intensity={0.04} />
      <pointLight position={[0, 7, 3]}   color="#00DFFB" intensity={4}   distance={28} />
      <pointLight position={[-10, 5, -8]} color="#0098F8" intensity={2}   distance={22} />
      <pointLight position={[10,  3, -4]} color="#52FEFE" intensity={1.5} distance={18} />

      <HoloGrid />
      <Particles count={200} />
      <DataPillars />

      <Ring radius={6.5}  speed={0.14}  tiltX={0.45} tiltZ={0.08}  color="#00DFFB" opacity={0.14} z={-9}  />
      <Ring radius={10.5} speed={-0.08} tiltX={0.80} tiltZ={0.28}  color="#52FEFE" opacity={0.09} z={-14} />
      <Ring radius={15}   speed={0.055} tiltX={1.20} tiltZ={-0.18} color="#0098F8" opacity={0.06} z={-19} />
    </>
  );
}

/* ─── Canvas export ───────────────────────────────────────────────────────── */
export default function HoloScene() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 5, 15], fov: 56, near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
