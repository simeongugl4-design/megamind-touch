import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Line, Float } from "@react-three/drei";
import * as THREE from "three";

interface BrainMeshProps {
  scanning: boolean;
}

const NeuralNodes = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const pts: { pos: [number, number, number]; delay: number; color: string }[] = [];
    const colors = ["#00F0FF", "#8B5CF6", "#FF69B4", "#00FF88", "#FFD700", "#FF6B6B"];
    for (let i = 0; i < 80; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 0.4;
      pts.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        delay: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i];
      if (!node) return;
      const t = clock.getElapsedTime();
      const pulse = scanning
        ? 0.3 + 0.7 * Math.abs(Math.sin(t * 3 + node.delay))
        : 0.15 + 0.15 * Math.sin(t + node.delay);
      (child as THREE.Mesh).scale.setScalar(pulse);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={scanning ? 3 : 0.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const Connections = ({ scanning }: { scanning: boolean }) => {
  const linesRef = useRef<THREE.Group>(null);

  const connections = useMemo(() => {
    const conns: { start: THREE.Vector3; end: THREE.Vector3; delay: number; color: string }[] = [];
    const colors = ["#00F0FF", "#8B5CF6", "#FF69B4", "#00FF88"];
    for (let i = 0; i < 40; i++) {
      const makePoint = () => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.0 + Math.random() * 0.4;
        return new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
      };
      conns.push({ start: makePoint(), end: makePoint(), delay: Math.random() * Math.PI * 2, color: colors[i % colors.length] });
    }
    return conns;
  }, []);

  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    const t = clock.getElapsedTime();
    linesRef.current.children.forEach((child, i) => {
      const conn = connections[i];
      if (!conn) return;
      const opacity = scanning
        ? 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + conn.delay))
        : 0.1;
      ((child as THREE.Line).material as THREE.LineBasicMaterial).opacity = opacity;
    });
  });

  const linePoints = useMemo(() => {
    return connections.map((conn) => {
      const mid = conn.start.clone().add(conn.end).multiplyScalar(0.5);
      mid.multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(conn.start, mid, conn.end);
      return { points: curve.getPoints(20).map(p => [p.x, p.y, p.z] as [number, number, number]), color: conn.color };
    });
  }, [connections]);

  return (
    <group ref={linesRef}>
      {linePoints.map((lp, i) => (
        <Line
          key={i}
          points={lp.points}
          color={lp.color}
          transparent
          opacity={scanning ? 0.5 : 0.1}
          lineWidth={scanning ? 1.5 : 0.5}
        />
      ))}
    </group>
  );
};

const ElectricPulses = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulses = useMemo(() => {
    return Array.from({ length: 20 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2;
      return {
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        speed: 0.5 + Math.random() * 2,
        offset: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !scanning) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const pulse = pulses[i];
      if (!pulse) return;
      const scale = 0.5 + Math.abs(Math.sin(t * pulse.speed + pulse.offset)) * 1.5;
      (child as THREE.Mesh).scale.setScalar(scanning ? scale * 0.08 : 0.01);
    });
  });

  if (!scanning) return null;

  return (
    <group ref={groupRef}>
      {pulses.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={5}
            toneMapped={false}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

const BrainCore = ({ scanning }: BrainMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * (scanning ? 0.5 : 0.2);
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.15;
  });

  return (
    <group ref={meshRef as any}>
      {/* Inner glow sphere */}
      <Sphere args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={scanning ? "#00F0FF" : "#1a2744"}
          emissive={scanning ? "#8B5CF6" : "#0a1628"}
          emissiveIntensity={scanning ? 0.8 : 0.1}
          transparent
          opacity={scanning ? 0.15 : 0.05}
        />
      </Sphere>
      {/* Main brain wireframe */}
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#0a1628"
          emissive={scanning ? "#00F0FF" : "#1a2744"}
          emissiveIntensity={scanning ? 0.6 : 0.15}
          wireframe
          transparent
          opacity={scanning ? 0.7 : 0.3}
          distort={scanning ? 0.35 : 0.15}
          speed={scanning ? 5 : 1.5}
        />
      </Sphere>
      {/* Outer aura */}
      <Sphere args={[1.3, 32, 32]}>
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#FF69B4"
          emissiveIntensity={scanning ? 0.3 : 0}
          transparent
          opacity={scanning ? 0.05 : 0}
          wireframe
        />
      </Sphere>
      <NeuralNodes scanning={scanning} />
      <Connections scanning={scanning} />
      <ElectricPulses scanning={scanning} />
    </group>
  );
};

const NeuralBrain3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-full min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary">
          3D Neural Clone
        </h3>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Cloning neural architecture..." : "Idle — awaiting scan"}
        </p>
      </div>
      {scanning && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[10px] text-green-400">REAL-TIME CLONE ACTIVE</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { label: "Neurons", value: "86B" },
              { label: "Synapses", value: "100T" },
              { label: "Signal", value: "120m/s" },
            ].map((s) => (
              <div key={s.label} className="px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                <p className="font-mono text-[9px] text-muted-foreground">{s.label}</p>
                <p className="font-orbitron text-[11px] font-bold text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00F0FF" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#8B5CF6" />
        <pointLight position={[0, 5, -5]} intensity={0.4} color="#FF69B4" />
        <pointLight position={[0, -5, 0]} intensity={0.3} color="#00FF88" />
        <BrainCore scanning={scanning} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={scanning ? 4 : 0.5}
        />
      </Canvas>
    </div>
  );
};

export default NeuralBrain3D;
