import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BrainMeshProps {
  scanning: boolean;
}

const NeuralNodes = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const pts: { pos: [number, number, number]; delay: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.1 + Math.random() * 0.3;
      pts.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        delay: Math.random() * Math.PI * 2,
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
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#00F0FF" : "#8B5CF6"}
            emissive={i % 3 === 0 ? "#00F0FF" : "#8B5CF6"}
            emissiveIntensity={scanning ? 2 : 0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

const Connections = ({ scanning }: { scanning: boolean }) => {
  const linesRef = useRef<THREE.Group>(null);

  const connections = useMemo(() => {
    const conns: { start: THREE.Vector3; end: THREE.Vector3; delay: number }[] = [];
    for (let i = 0; i < 30; i++) {
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
      conns.push({ start: makePoint(), end: makePoint(), delay: Math.random() * Math.PI * 2 });
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

  return (
    <group ref={linesRef}>
      {connections.map((conn, i) => {
        const mid = conn.start.clone().add(conn.end).multiplyScalar(0.5);
        mid.multiplyScalar(1.3);
        const curve = new THREE.QuadraticBezierCurve3(conn.start, mid, conn.end);
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={i % 2 === 0 ? "#00F0FF" : "#8B5CF6"}
              transparent
              opacity={0.1}
            />
          </line>
        );
      })}
    </group>
  );
};

const BrainCore = ({ scanning }: BrainMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
  });

  return (
    <group ref={meshRef as any}>
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#0a1628"
          emissive={scanning ? "#00F0FF" : "#1a2744"}
          emissiveIntensity={scanning ? 0.4 : 0.15}
          wireframe
          transparent
          opacity={scanning ? 0.6 : 0.3}
          distort={scanning ? 0.3 : 0.15}
          speed={scanning ? 4 : 1.5}
        />
      </Sphere>
      <NeuralNodes scanning={scanning} />
      <Connections scanning={scanning} />
    </group>
  );
};

const NeuralBrain3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-[400px] lg:h-[500px] rounded-lg border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary">
          3D Neural Map
        </h3>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Active scan in progress..." : "Idle — awaiting input"}
        </p>
      </div>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00F0FF" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8B5CF6" />
        <BrainCore scanning={scanning} />
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

export default NeuralBrain3D;
