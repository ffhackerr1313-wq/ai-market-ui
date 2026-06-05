"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { sceneScroll } from "@/lib/landingState";

// ─── Per-section config ────────────────────────────────────────────────────────
const SECTION_COLORS  = ["#00DFFB", "#0098F8", "#52FEFE", "#00FF9F", "#00DFFB"];
const SECTION_DISTORT = [0.45,      0.32,       0.58,      0.28,      0.50];
const SECTION_SCALE   = [2.2,       1.5,        1.8,       1.4,       2.1];
const SECTION_CAM: [number, number, number][] = [
  [0,   0.5,  9.5],  // 0 Hero     — centred, frontal
  [4.5, 1.0,  7.5],  // 1 Pulse    — right side, globe on right
  [-3,  0.5,  8.0],  // 2 Signals  — left shift
  [1.5, -1.0, 7.0],  // 3 Portfolio — slight down
  [0,   0.0,  8.0],  // 4 CTA      — back to centre
];

// ─── Central morphing shape ────────────────────────────────────────────────────
function CentralShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matRef  = useRef<any>(null);
  const { camera } = useThree();
  const camTarget = useRef(new THREE.Vector3(0, 0.5, 9.5));

  useFrame(({ clock }, delta) => {
    if (!meshRef.current || !matRef.current) return;
    const t = clock.elapsedTime;
    const sec = Math.min(sceneScroll.section, 4);

    // ── Floating animation ──
    meshRef.current.position.y = Math.sin(t * 0.45) * 0.28;

    // ── Rotation ──
    meshRef.current.rotation.y += delta * 0.14;
    meshRef.current.rotation.z += delta * 0.045;

    // ── Scale lerp ──
    const tScale = SECTION_SCALE[sec];
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(s, tScale, delta * 1.8));

    // ── Distort lerp ──
    matRef.current.distort = THREE.MathUtils.lerp(
      matRef.current.distort, SECTION_DISTORT[sec], delta * 1.4
    );

    // ── Color lerp ──
    const tColor = new THREE.Color(SECTION_COLORS[sec]);
    (matRef.current.color as THREE.Color).lerp(tColor, delta * 1.6);

    // ── Camera lerp ──
    const [cx, cy, cz] = SECTION_CAM[sec];
    camTarget.current.set(cx, cy, cz);
    camera.position.lerp(camTarget.current, delta * 1.1);
    camera.lookAt(0, 0, 0);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshDistortMaterial
        ref={matRef}
        color="#00DFFB"
        distort={0.45}
        speed={2.2}
        roughness={0.06}
        metalness={0.88}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}

// Inner glow halo around the central shape
function ShapeGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.04 + Math.sin(clock.elapsedTime * 1.2) * 0.02;
  });
  return (
    <mesh ref={ref} scale={1.6}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color="#00DFFB"
        transparent
        opacity={0.05}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Holographic floor grid ────────────────────────────────────────────────────
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
  float line(float v, float w) { return 1.0 - smoothstep(0.0, w, abs(fract(v-0.5)-0.5)); }
  void main() {
    vec2 g1 = vUv * 22.0;
    float gA = max(line(g1.x, 0.04), line(g1.y - uTime*0.13, 0.04));
    float horizonFade = smoothstep(0.0, 0.65, vUv.y);
    float edgeFade    = 1.0 - smoothstep(0.28, 0.52, abs(vUv.x - 0.5));
    float scanY = mod(uTime * 0.26, 1.0);
    float scan  = 1.0 - smoothstep(0.0, 0.018, abs(vUv.y - scanY));
    float alpha = (gA * 0.6 + scan * 0.35) * horizonFade * edgeFade;
    vec3  col   = uColor * (1.0 + gA * 1.8 + scan * 2.2);
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, -6]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        args={[{ uniforms, vertexShader: VERT, fragmentShader: FRAG }]}
        transparent depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Floating particles ────────────────────────────────────────────────────────
function Particles({ count = 180 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 34;
      positions[i*3+1] = Math.random() * 16 - 4;
      positions[i*3+2] = Math.random() * -26 - 2;
      speeds[i]        = 0.003 + Math.random() * 0.006;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i*3+1] += speeds[i];
      if (arr[i*3+1] > 12) {
        arr[i*3+1] = -4;
        arr[i*3]   = (Math.random() - 0.5) * 34;
        arr[i*3+2] = Math.random() * -26 - 2;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#00DFFB" size={0.038} transparent opacity={0.38}
        sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </points>
  );
}

// ─── Orbital rings ─────────────────────────────────────────────────────────────
function Ring({ radius, speed, tiltX, tiltZ, color, opacity, z }: {
  radius:number; speed:number; tiltX:number; tiltZ:number;
  color:string; opacity:number; z:number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]} position={[0, 1.5, z]}>
      <torusGeometry args={[radius, 0.018, 8, 120]} />
      <meshBasicMaterial color={color} transparent opacity={opacity}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// ─── Scene root ────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <fog attach="fog" args={["#000308", 22, 48]} />
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 6, 3]}   color="#00DFFB" intensity={6}   distance={28} />
      <pointLight position={[-9, 4, -7]} color="#0098F8" intensity={2.5} distance={22} />
      <pointLight position={[9,  3, -5]} color="#52FEFE" intensity={1.8} distance={18} />

      <CentralShape />
      <ShapeGlow />
      <HoloGrid />
      <Particles count={180} />

      <Ring radius={5.5}  speed={0.13}  tiltX={0.44} tiltZ={0.09}  color="#00DFFB" opacity={0.13} z={-9}  />
      <Ring radius={9.5}  speed={-0.08} tiltX={0.82} tiltZ={0.26}  color="#52FEFE" opacity={0.08} z={-14} />
      <Ring radius={14.0} speed={0.05}  tiltX={1.22} tiltZ={-0.18} color="#0098F8" opacity={0.05} z={-20} />
    </>
  );
}

// ─── Canvas export ─────────────────────────────────────────────────────────────
export default function LandingScene() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
      <Canvas
        camera={{ position:[0, 0.5, 9.5], fov:56, near:0.1, far:60 }}
        gl={{ alpha:true, antialias:false, powerPreference:"high-performance" }}
        dpr={[1, 1.5]}
        style={{ background:"transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
