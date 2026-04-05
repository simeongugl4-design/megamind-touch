import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

const HeartShape = ({ scanning }: { scanning: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Heartbeat effect
    const heartRate = scanning ? 1.2 : 0.7;
    const beat = 1 + Math.pow(Math.sin(t * Math.PI * heartRate), 12) * 0.15;
    meshRef.current.scale.setScalar(beat * 1.8);
    meshRef.current.rotation.y = t * (scanning ? 0.4 : 0.15);
    meshRef.current.rotation.z = Math.PI;

    if (glowRef.current) {
      glowRef.current.scale.setScalar(beat * 1.85);
      glowRef.current.rotation.y = t * (scanning ? 0.4 : 0.15);
      glowRef.current.rotation.z = Math.PI;
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      {/* Outer glow */}
      <mesh ref={glowRef} geometry={heartShape} position={[-0.25, -0.5, -0.2]}>
        <meshStandardMaterial
          color="#FF1744"
          emissive="#FF1744"
          emissiveIntensity={scanning ? 0.4 : 0.1}
          transparent
          opacity={scanning ? 0.15 : 0.05}
          wireframe
        />
      </mesh>
      {/* Main heart */}
      <mesh ref={meshRef} geometry={heartShape} position={[-0.25, -0.5, -0.2]}>
        <meshStandardMaterial
          color="#D50000"
          emissive="#FF1744"
          emissiveIntensity={scanning ? 1.2 : 0.3}
          roughness={0.3}
          metalness={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const BloodVessels = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const vessels = useMemo(() => {
    const v: { geo: THREE.TubeGeometry; color: string }[] = [];
    const colors = ["#FF1744", "#D50000", "#FF5252", "#E53935", "#FF8A80"];
    for (let i = 0; i < 20; i++) {
      const pts: THREE.Vector3[] = [];
      const startAngle = Math.random() * Math.PI * 2;
      const startR = 0.6 + Math.random() * 0.3;
      for (let j = 0; j <= 5; j++) {
        const t = j / 5;
        const angle = startAngle + t * (Math.random() - 0.5) * 2;
        const r = startR + t * 0.5;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * r,
          (Math.random() - 0.5) * 1.5,
          Math.sin(angle) * r
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      v.push({
        geo: new THREE.TubeGeometry(curve, 20, 0.015 + Math.random() * 0.015, 6, false),
        color: colors[i % colors.length],
      });
    }
    return v;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * (scanning ? 0.3 : 0.1);
  });

  return (
    <group ref={groupRef}>
      {vessels.map((v, i) => (
        <mesh key={i} geometry={v.geo}>
          <meshStandardMaterial
            color={v.color}
            emissive={v.color}
            emissiveIntensity={scanning ? 1.5 : 0.3}
            toneMapped={false}
            transparent
            opacity={scanning ? 0.7 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

const BloodParticles = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ),
      speed: 0.5 + Math.random() * 2,
      offset: Math.random() * Math.PI * 2,
    })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !scanning) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const s = 0.3 + Math.abs(Math.sin(t * p.speed + p.offset));
      (child as THREE.Mesh).scale.setScalar(s * 0.06);
      // Orbit motion
      const angle = t * p.speed * 0.3 + p.offset;
      (child as THREE.Mesh).position.x = p.pos.x + Math.sin(angle) * 0.3;
      (child as THREE.Mesh).position.z = p.pos.z + Math.cos(angle) * 0.3;
    });
  });

  if (!scanning) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial
            color="#FF1744"
            emissive="#FF1744"
            emissiveIntensity={4}
            toneMapped={false}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

const Heart3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-full min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-400">
          3D Heart Clone
        </h3>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Cloning cardiac structure..." : "Idle — awaiting scan"}
        </p>
      </div>
      {scanning && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[10px] text-red-400">HEART CLONE ACTIVE</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { label: "BPM", value: "72" },
              { label: "EF", value: "62%" },
              { label: "BP", value: "120/80" },
            ].map((s) => (
              <div key={s.label} className="px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                <p className="font-mono text-[9px] text-muted-foreground">{s.label}</p>
                <p className="font-orbitron text-[11px] font-bold text-red-400">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#FF1744" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#D50000" />
        <pointLight position={[0, 5, -5]} intensity={0.4} color="#FF5252" />
        <pointLight position={[0, -3, 3]} intensity={0.3} color="#FF8A80" />
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
          <HeartShape scanning={scanning} />
        </Float>
        <BloodVessels scanning={scanning} />
        <BloodParticles scanning={scanning} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={scanning ? 3 : 0.5}
        />
      </Canvas>
    </div>
  );
};

export default Heart3D;
