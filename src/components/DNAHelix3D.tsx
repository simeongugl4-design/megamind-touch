import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

const basePairColors: [string, string][] = [
  ["#00FF88", "#FF6B6B"], // A-T green-red
  ["#00F0FF", "#FFD700"], // G-C cyan-gold
  ["#8B5CF6", "#FF69B4"], // purple-pink
  ["#00F0FF", "#FF6B6B"], // cyan-red
];

const HelixStrand = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rungs = 40;
  const radius = 0.6;
  const height = 8;
  const turns = 3;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * (scanning ? 0.8 : 0.3);
  });

  const helixData = useMemo(() => {
    const data: {
      pos1: [number, number, number];
      pos2: [number, number, number];
      color1: string;
      color2: string;
      y: number;
    }[] = [];
    for (let i = 0; i < rungs; i++) {
      const t = i / rungs;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 2 * turns;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      const [c1, c2] = basePairColors[i % basePairColors.length];
      data.push({ pos1: [x1, y, z1], pos2: [x2, y, z2], color1: c1, color2: c2, y });
    }
    return data;
  }, []);

  // Backbone curves
  const backbone1Points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 2 * turns;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const backbone2Points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 2 * turns + Math.PI;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const tubeGeo1 = useMemo(() => new THREE.TubeGeometry(backbone1Points, 200, 0.04, 8, false), [backbone1Points]);
  const tubeGeo2 = useMemo(() => new THREE.TubeGeometry(backbone2Points, 200, 0.04, 8, false), [backbone2Points]);

  return (
    <group ref={groupRef}>
      {/* Backbone strands */}
      <mesh geometry={tubeGeo1}>
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={scanning ? 1.5 : 0.3} toneMapped={false} />
      </mesh>
      <mesh geometry={tubeGeo2}>
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={scanning ? 1.5 : 0.3} toneMapped={false} />
      </mesh>

      {/* Base pair rungs */}
      {helixData.map((d, i) => {
        const mid: [number, number, number] = [
          (d.pos1[0] + d.pos2[0]) / 2,
          (d.pos1[1] + d.pos2[1]) / 2,
          (d.pos1[2] + d.pos2[2]) / 2,
        ];
        const dir = new THREE.Vector3(d.pos2[0] - d.pos1[0], 0, d.pos2[2] - d.pos1[2]);
        const len = dir.length();
        return (
          <group key={i}>
            {/* Left nucleotide */}
            <mesh position={d.pos1}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={d.color1} emissive={d.color1} emissiveIntensity={scanning ? 2 : 0.5} toneMapped={false} />
            </mesh>
            {/* Right nucleotide */}
            <mesh position={d.pos2}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={d.color2} emissive={d.color2} emissiveIntensity={scanning ? 2 : 0.5} toneMapped={false} />
            </mesh>
            {/* Rung connector */}
            <mesh position={mid} rotation={[0, Math.atan2(dir.z, dir.x), 0]}>
              <cylinderGeometry args={[0.015, 0.015, len, 4]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={scanning ? 0.5 : 0.1} transparent opacity={0.4} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const FloatingParticles = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useMemo(() =>
    Array.from({ length: 50 }, () => ({
      pos: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 1.5,
      offset: Math.random() * Math.PI * 2,
      color: ["#00F0FF", "#8B5CF6", "#00FF88", "#FFD700", "#FF69B4"][Math.floor(Math.random() * 5)],
    })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !scanning) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const s = 0.3 + Math.abs(Math.sin(t * p.speed + p.offset)) * 0.7;
      (child as THREE.Mesh).scale.setScalar(s);
    });
  });

  if (!scanning) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={3} toneMapped={false} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const DNAHelix3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-full min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-orbitron text-sm tracking-widest uppercase text-green-400">
          3D DNA Clone
        </h3>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Sequencing genome in real-time..." : "Idle — awaiting scan"}
        </p>
      </div>
      {scanning && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[10px] text-green-400">DNA CLONE ACTIVE</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { label: "Base Pairs", value: "3.2B" },
              { label: "Chromosomes", value: "23 Pairs" },
              { label: "Accuracy", value: "99.97%" },
            ].map((s) => (
              <div key={s.label} className="px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                <p className="font-mono text-[9px] text-muted-foreground">{s.label}</p>
                <p className="font-orbitron text-[11px] font-bold text-green-400">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[3, 5, 5]} intensity={1} color="#00F0FF" />
        <pointLight position={[-3, -5, 5]} intensity={0.6} color="#8B5CF6" />
        <pointLight position={[0, 0, -5]} intensity={0.4} color="#00FF88" />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <HelixStrand scanning={scanning} />
        </Float>
        <FloatingParticles scanning={scanning} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={scanning ? 3 : 0.5} />
      </Canvas>
    </div>
  );
};

export default DNAHelix3D;
