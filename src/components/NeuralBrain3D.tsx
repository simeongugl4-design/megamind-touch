import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const CorticalSurface = ({ scanning }: { scanning: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);

  // Create realistic brain hemispheres with sulci/gyri
  const hemisphereGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Create cortical fold patterns (sulci/gyri)
      const fold1 = Math.sin(x * 8 + y * 3) * 0.06;
      const fold2 = Math.cos(y * 6 + z * 4) * 0.04;
      const fold3 = Math.sin(z * 10 + x * 5) * 0.03;
      const r = Math.sqrt(x * x + y * y + z * z);
      const scale = 1 + fold1 + fold2 + fold3;
      pos.setXYZ(i, x / r * scale, y / r * scale, z / r * scale);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Brain stem
  const stemGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const r = 0.15 + Math.sin(t * Math.PI) * 0.08;
      pts.push(new THREE.Vector2(r, -0.8 - t * 0.7));
    }
    return new THREE.LatheGeometry(pts, 16);
  }, []);

  // Cerebellum
  const cerebellumGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.4, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const folia = Math.sin(y * 20) * 0.03;
      const r = Math.sqrt(x * x + y * y + z * z);
      const s = 1 + folia;
      pos.setXYZ(i, (x / r) * 0.4 * s, (y / r) * 0.3 * s, (z / r) * 0.35 * s);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * (scanning ? 0.4 : 0.15);
  });

  return (
    <group ref={meshRef}>
      {/* Left hemisphere */}
      <mesh geometry={hemisphereGeo} position={[-0.08, 0.1, 0]} scale={[0.9, 1.05, 0.95]}>
        <meshPhysicalMaterial
          color="#e8b4b4"
          emissive={scanning ? "#00F0FF" : "#1a1020"}
          emissiveIntensity={scanning ? 0.3 : 0.05}
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Right hemisphere */}
      <mesh geometry={hemisphereGeo} position={[0.08, 0.1, 0]} scale={[0.9, 1.05, 0.95]}>
        <meshPhysicalMaterial
          color="#dba8a8"
          emissive={scanning ? "#8B5CF6" : "#1a1020"}
          emissiveIntensity={scanning ? 0.25 : 0.05}
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Central fissure */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.6, 0.8]} />
        <meshStandardMaterial color="#c47070" transparent opacity={0.3} />
      </mesh>
      {/* Brain stem */}
      <mesh geometry={stemGeo} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#d49e9e"
          emissive={scanning ? "#FF69B4" : "#0a0a15"}
          emissiveIntensity={scanning ? 0.2 : 0.02}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>
      {/* Cerebellum */}
      <mesh geometry={cerebellumGeo} position={[0, -0.55, -0.3]}>
        <meshPhysicalMaterial
          color="#c88e8e"
          emissive={scanning ? "#00FF88" : "#0a0a15"}
          emissiveIntensity={scanning ? 0.25 : 0.03}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};

const NeuralActivity = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const pts: { pos: [number, number, number]; delay: number; color: string; region: string }[] = [];
    const regions = [
      { name: "frontal", center: [0, 0.5, 0.5], spread: 0.4, color: "#00F0FF", count: 20 },
      { name: "temporal", center: [0.7, 0, 0], spread: 0.3, color: "#8B5CF6", count: 12 },
      { name: "parietal", center: [0, 0.7, -0.2], spread: 0.35, color: "#FF69B4", count: 15 },
      { name: "occipital", center: [0, 0.2, -0.8], spread: 0.3, color: "#00FF88", count: 12 },
      { name: "deep", center: [0, -0.1, 0], spread: 0.25, color: "#FFD700", count: 10 },
    ];
    regions.forEach(r => {
      for (let i = 0; i < r.count; i++) {
        pts.push({
          pos: [
            r.center[0] + (Math.random() - 0.5) * r.spread * 2,
            r.center[1] + (Math.random() - 0.5) * r.spread * 2,
            r.center[2] + (Math.random() - 0.5) * r.spread * 2,
          ] as [number, number, number],
          delay: Math.random() * Math.PI * 2,
          color: r.color,
          region: r.name,
        });
      }
    });
    return pts;
  }, []);

  // Synaptic connections
  const connections = useMemo(() => {
    const conns: { points: THREE.Vector3[]; color: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a && b && a.region !== b.region) {
        const start = new THREE.Vector3(...a.pos);
        const end = new THREE.Vector3(...b.pos);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.y += 0.2 + Math.random() * 0.3;
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        conns.push({ points: curve.getPoints(16), color: a.color });
      }
    }
    return conns;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    let idx = 0;
    groupRef.current.children.forEach((child) => {
      if ((child as THREE.Mesh).isMesh && idx < nodes.length) {
        const node = nodes[idx];
        const pulse = scanning
          ? 0.4 + 0.6 * Math.abs(Math.sin(t * 4 + node.delay))
          : 0.1 + 0.1 * Math.sin(t * 0.5 + node.delay);
        child.scale.setScalar(pulse);
        idx++;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={scanning ? 4 : 0.5}
            toneMapped={false}
            transparent
            opacity={scanning ? 0.9 : 0.3}
          />
        </mesh>
      ))}
      {scanning && connections.map((conn, i) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(conn.points);
        const lineMat = new THREE.LineBasicMaterial({ color: conn.color, transparent: true, opacity: 0.3 });
        const lineObj = new THREE.Line(lineGeo, lineMat);
        return <primitive key={`c${i}`} object={lineObj} />;
      })}
    </group>
  );
};

const ScanField = ({ scanning }: { scanning: boolean }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!ringRef.current || !scanning) return;
    const t = clock.getElapsedTime();
    ringRef.current.position.y = Math.sin(t * 2) * 1.2;
    ringRef.current.rotation.x = Math.PI / 2;
  });

  if (!scanning) return null;

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[1.4, 0.01, 8, 64]} />
      <meshStandardMaterial
        color="#00F0FF"
        emissive="#00F0FF"
        emissiveIntensity={3}
        toneMapped={false}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

const NeuralBrain3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-primary">
          3D Neural Clone
        </h3>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Cloning neural architecture..." : "Idle — awaiting scan"}
        </p>
      </div>
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-green-400">REAL-TIME CLONE ACTIVE</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { label: "Neurons", value: "86B" },
              { label: "Synapses", value: "100T" },
              { label: "Signal", value: "120m/s" },
            ].map((s) => (
              <div key={s.label} className="px-1.5 sm:px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 0.3, 3], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 5]} intensity={1.2} color="#fff5f0" />
        <pointLight position={[-3, 2, 3]} intensity={0.6} color="#00F0FF" />
        <pointLight position={[3, -2, -3]} intensity={0.4} color="#8B5CF6" />
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#FF69B4" />
        <hemisphereLight intensity={0.3} color="#ffeedd" groundColor="#001122" />
        <CorticalSurface scanning={scanning} />
        <NeuralActivity scanning={scanning} />
        <ScanField scanning={scanning} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={scanning ? 3 : 0.5}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      </Canvas>
    </div>
  );
};

export default NeuralBrain3D;
