import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

// Realistic base pair colors matching nucleotide chemistry
const basePairs: { color1: string; color2: string; label: string }[] = [
  { color1: "#22c55e", color2: "#ef4444", label: "A-T" },
  { color1: "#06b6d4", color2: "#eab308", label: "G-C" },
  { color1: "#22c55e", color2: "#ef4444", label: "A-T" },
  { color1: "#06b6d4", color2: "#eab308", label: "G-C" },
  { color1: "#ef4444", color2: "#22c55e", label: "T-A" },
  { color1: "#eab308", color2: "#06b6d4", label: "C-G" },
];

const DoubleHelix = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rungs = 60;
  const radius = 0.55;
  const height = 10;
  const turns = 4;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * (scanning ? 0.6 : 0.2);
  });

  const helixData = useMemo(() => {
    const data: {
      pos1: [number, number, number];
      pos2: [number, number, number];
      color1: string;
      color2: string;
    }[] = [];
    for (let i = 0; i < rungs; i++) {
      const t = i / rungs;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 2 * turns;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      const bp = basePairs[i % basePairs.length];
      data.push({ pos1: [x1, y, z1], pos2: [x2, y, z2], color1: bp.color1, color2: bp.color2 });
    }
    return data;
  }, []);

  // Sugar-phosphate backbone with realistic tube thickness
  const backbone1 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 2 * turns;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.045, 12, false);
  }, []);

  const backbone2 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 2 * turns + Math.PI;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.045, 12, false);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Backbone strand 1 - phosphate */}
      <mesh geometry={backbone1}>
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={scanning ? 1.2 : 0.2}
          roughness={0.3}
          metalness={0.2}
          clearcoat={0.5}
          toneMapped={false}
        />
      </mesh>
      {/* Backbone strand 2 - sugar */}
      <mesh geometry={backbone2}>
        <meshPhysicalMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={scanning ? 1.2 : 0.2}
          roughness={0.3}
          metalness={0.2}
          clearcoat={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Base pair rungs with nucleotide spheres */}
      {helixData.map((d, i) => {
        const mid: [number, number, number] = [
          (d.pos1[0] + d.pos2[0]) / 2,
          (d.pos1[1] + d.pos2[1]) / 2,
          (d.pos1[2] + d.pos2[2]) / 2,
        ];
        const dir = new THREE.Vector3(d.pos2[0] - d.pos1[0], 0, d.pos2[2] - d.pos1[2]);
        const len = dir.length();
        // Hydrogen bond positions (2 for A-T, 3 for G-C)
        const isGC = i % 3 === 1;
        return (
          <group key={i}>
            {/* Left nucleotide */}
            <mesh position={d.pos1}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshPhysicalMaterial
                color={d.color1}
                emissive={d.color1}
                emissiveIntensity={scanning ? 2.5 : 0.4}
                roughness={0.4}
                clearcoat={0.6}
                toneMapped={false}
              />
            </mesh>
            {/* Right nucleotide */}
            <mesh position={d.pos2}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshPhysicalMaterial
                color={d.color2}
                emissive={d.color2}
                emissiveIntensity={scanning ? 2.5 : 0.4}
                roughness={0.4}
                clearcoat={0.6}
                toneMapped={false}
              />
            </mesh>
            {/* Hydrogen bond connector */}
            <mesh position={mid} rotation={[0, Math.atan2(dir.z, dir.x), 0]}>
              <cylinderGeometry args={[0.012, 0.012, len * 0.85, 6]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={scanning ? 0.8 : 0.15}
                transparent
                opacity={scanning ? 0.5 : 0.25}
                toneMapped={false}
              />
            </mesh>
            {/* Extra hydrogen bond dots for GC pairs */}
            {isGC && (
              <>
                <mesh position={[mid[0], mid[1], mid[2]]}>
                  <sphereGeometry args={[0.02, 6, 6]} />
                  <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={scanning ? 2 : 0.3} toneMapped={false} transparent opacity={0.6} />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* Major/minor groove indicators */}
      {scanning && Array.from({ length: 8 }, (_, i) => {
        const t = (i + 0.5) / 8;
        const y = (t - 0.5) * height;
        const angle = t * Math.PI * 2 * turns + Math.PI / 2;
        return (
          <mesh key={`groove${i}`} position={[Math.cos(angle) * 0.15, y, Math.sin(angle) * 0.15]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

const SequencingBeam = ({ scanning }: { scanning: boolean }) => {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!beamRef.current || !scanning) return;
    beamRef.current.position.y = ((clock.getElapsedTime() * 1.5) % 10) - 5;
  });

  if (!scanning) return null;

  return (
    <mesh ref={beamRef} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[1, 0.008, 8, 64]} />
      <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={5} toneMapped={false} transparent opacity={0.7} />
    </mesh>
  );
};

const DNAHelix3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-green-400">
          3D DNA Clone
        </h3>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Sequencing genome in real-time..." : "Idle — awaiting scan"}
        </p>
      </div>
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-green-400">DNA CLONE ACTIVE</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { label: "Base Pairs", value: "3.2B" },
              { label: "Chromosomes", value: "23 Pairs" },
              { label: "Accuracy", value: "99.97%" },
            ].map((s) => (
              <div key={s.label} className="px-1.5 sm:px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-green-400">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-3, -5, 5]} intensity={0.6} color="#8B5CF6" />
        <pointLight position={[0, 0, -5]} intensity={0.4} color="#00FF88" />
        <hemisphereLight intensity={0.2} color="#eeffee" groundColor="#001100" />
        <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
          <DoubleHelix scanning={scanning} />
        </Float>
        <SequencingBeam scanning={scanning} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={scanning ? 2.5 : 0.5} />
      </Canvas>
    </div>
  );
};

export default DNAHelix3D;
