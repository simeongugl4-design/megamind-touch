import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

const AnatomicalHeart = ({ scanning }: { scanning: boolean }) => {
  const heartRef = useRef<THREE.Group>(null);

  // Realistic heart shape with 4 visible chambers
  const heartGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 12,
      steps: 3,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    });
  }, []);

  // Aorta
  const aortaGeo = useMemo(() => {
    const pts = [
      new THREE.Vector3(0.15, 0.7, 0),
      new THREE.Vector3(0.1, 1.0, 0.05),
      new THREE.Vector3(0.25, 1.3, 0),
      new THREE.Vector3(0.5, 1.4, -0.1),
      new THREE.Vector3(0.7, 1.2, -0.2),
      new THREE.Vector3(0.75, 0.9, -0.15),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 30, 0.08, 12, false);
  }, []);

  // Pulmonary artery
  const pulmonaryGeo = useMemo(() => {
    const pts = [
      new THREE.Vector3(-0.05, 0.65, 0.1),
      new THREE.Vector3(-0.15, 0.9, 0.15),
      new THREE.Vector3(-0.3, 1.1, 0.1),
      new THREE.Vector3(-0.5, 1.2, 0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.06, 10, false);
  }, []);

  // Coronary arteries on the surface
  const coronaries = useMemo(() => {
    const arts: THREE.TubeGeometry[] = [];
    const paths = [
      // LAD
      [new THREE.Vector3(0.15, 0.5, 0.25), new THREE.Vector3(0.1, 0.35, 0.3), new THREE.Vector3(0.05, 0.15, 0.28), new THREE.Vector3(0.0, -0.05, 0.22)],
      // RCA
      [new THREE.Vector3(0.35, 0.5, 0.15), new THREE.Vector3(0.4, 0.35, 0.2), new THREE.Vector3(0.38, 0.15, 0.18), new THREE.Vector3(0.3, -0.05, 0.1)],
      // LCx
      [new THREE.Vector3(0.0, 0.45, 0.2), new THREE.Vector3(-0.1, 0.35, 0.22), new THREE.Vector3(-0.15, 0.2, 0.18)],
    ];
    paths.forEach(pts => {
      const curve = new THREE.CatmullRomCurve3(pts);
      arts.push(new THREE.TubeGeometry(curve, 20, 0.015, 6, false));
    });
    return arts;
  }, []);

  // Veins
  const veins = useMemo(() => {
    const v: THREE.TubeGeometry[] = [];
    const paths = [
      [new THREE.Vector3(-0.15, 0.6, -0.1), new THREE.Vector3(-0.25, 0.8, -0.15), new THREE.Vector3(-0.35, 1.0, -0.1)],
      [new THREE.Vector3(-0.1, 0.55, -0.15), new THREE.Vector3(-0.18, 0.75, -0.2), new THREE.Vector3(-0.3, 0.95, -0.15)],
    ];
    paths.forEach(pts => {
      v.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.04, 8, false));
    });
    return v;
  }, []);

  useFrame(({ clock }) => {
    if (!heartRef.current) return;
    const t = clock.getElapsedTime();
    const heartRate = scanning ? 1.2 : 0.7;
    // Realistic systole/diastole cycle
    const systole = Math.pow(Math.sin(t * Math.PI * heartRate), 12);
    const beat = 1 + systole * 0.12;
    heartRef.current.scale.setScalar(beat * 1.6);
    heartRef.current.rotation.y = t * (scanning ? 0.3 : 0.1);
    heartRef.current.rotation.z = Math.PI;
    heartRef.current.rotation.x = 0.15;
  });

  return (
    <group position={[0, -0.2, 0]}>
      <group ref={heartRef} position={[-0.25, -0.3, -0.2]}>
        {/* Main heart muscle (myocardium) */}
        <mesh geometry={heartGeo}>
          <meshPhysicalMaterial
            color="#b91c1c"
            emissive="#dc2626"
            emissiveIntensity={scanning ? 0.6 : 0.15}
            roughness={0.5}
            metalness={0.15}
            clearcoat={0.4}
            clearcoatRoughness={0.3}
            toneMapped={false}
          />
        </mesh>
        {/* Endocardium (inner surface sheen) */}
        <mesh geometry={heartGeo} scale={0.95}>
          <meshPhysicalMaterial
            color="#991b1b"
            emissive="#ef4444"
            emissiveIntensity={scanning ? 0.3 : 0.05}
            roughness={0.3}
            metalness={0.3}
            transparent
            opacity={0.3}
          />
        </mesh>
        {/* Aorta */}
        <mesh geometry={aortaGeo}>
          <meshPhysicalMaterial
            color="#dc2626"
            emissive="#f87171"
            emissiveIntensity={scanning ? 0.8 : 0.2}
            roughness={0.4}
            metalness={0.2}
            clearcoat={0.3}
            toneMapped={false}
          />
        </mesh>
        {/* Pulmonary artery */}
        <mesh geometry={pulmonaryGeo}>
          <meshPhysicalMaterial
            color="#3b82f6"
            emissive="#60a5fa"
            emissiveIntensity={scanning ? 0.7 : 0.15}
            roughness={0.4}
            metalness={0.2}
            clearcoat={0.3}
            toneMapped={false}
          />
        </mesh>
        {/* Coronary arteries */}
        {coronaries.map((geo, i) => (
          <mesh key={`ca${i}`} geometry={geo}>
            <meshPhysicalMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={scanning ? 2 : 0.3}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* Pulmonary veins */}
        {veins.map((geo, i) => (
          <mesh key={`v${i}`} geometry={geo}>
            <meshPhysicalMaterial
              color="#6366f1"
              emissive="#818cf8"
              emissiveIntensity={scanning ? 0.5 : 0.1}
              roughness={0.4}
              metalness={0.1}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* Septum indicator line */}
        <mesh position={[0.25, 0.45, 0.26]}>
          <boxGeometry args={[0.008, 0.6, 0.01]} />
          <meshStandardMaterial color="#fca5a5" transparent opacity={scanning ? 0.5 : 0.2} />
        </mesh>
      </group>
    </group>
  );
};

const BloodFlow = ({ scanning }: { scanning: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useMemo(() =>
    Array.from({ length: 50 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5
      ),
      speed: 0.5 + Math.random() * 2,
      offset: Math.random() * Math.PI * 2,
      isOxygenated: Math.random() > 0.4,
    })), []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !scanning) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const s = 0.3 + Math.abs(Math.sin(t * p.speed + p.offset));
      (child as THREE.Mesh).scale.setScalar(s * 0.04);
      const angle = t * p.speed * 0.4 + p.offset;
      (child as THREE.Mesh).position.x = p.pos.x + Math.sin(angle) * 0.3;
      (child as THREE.Mesh).position.y = p.pos.y + Math.cos(angle * 0.7) * 0.2;
      (child as THREE.Mesh).position.z = p.pos.z + Math.cos(angle) * 0.3;
    });
  });

  if (!scanning) return null;

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color={p.isOxygenated ? "#ef4444" : "#3b82f6"}
            emissive={p.isOxygenated ? "#ef4444" : "#3b82f6"}
            emissiveIntensity={3}
            toneMapped={false}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

const ECGLine = ({ scanning }: { scanning: boolean }) => {
  const lineObjRef = useRef<THREE.Line | null>(null);
  
  const lineObj = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 100; i++) {
      points.push(new THREE.Vector3((i / 100 - 0.5) * 4, -1.8, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: "#22c55e" });
    const line = new THREE.Line(geo, mat);
    return line;
  }, []);

  useFrame(({ clock }) => {
    if (!scanning) return;
    const geo = lineObj.geometry;
    const pos = geo.attributes.position;
    const t = clock.getElapsedTime();
    for (let i = 0; i < pos.count; i++) {
      const x = (i / pos.count - 0.5) * 4;
      const phase = x * 3 - t * 4;
      let y = 0;
      const p = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (p > 0.5 && p < 1.0) y = Math.sin((p - 0.5) * Math.PI * 2) * 0.05;
      else if (p > 1.2 && p < 1.5) y = -Math.sin((p - 1.2) * Math.PI / 0.3) * 0.03;
      else if (p > 1.5 && p < 2.0) y = Math.sin((p - 1.5) * Math.PI / 0.5) * 0.2;
      else if (p > 2.0 && p < 2.3) y = -Math.sin((p - 2.0) * Math.PI / 0.3) * 0.04;
      else if (p > 2.8 && p < 3.5) y = Math.sin((p - 2.8) * Math.PI / 0.7) * 0.06;
      pos.setY(i, y - 1.8);
    }
    pos.needsUpdate = true;
  });

  if (!scanning) return null;

  return <primitive object={lineObj} />;
};

const Heart3D = ({ scanning = false }: { scanning?: boolean }) => {
  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[350px] rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-red-400">
          3D Heart Clone
        </h3>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">
          {scanning ? "⚡ Cloning cardiac structure..." : "Idle — awaiting scan"}
        </p>
      </div>
      {scanning && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] text-red-400">HEART CLONE ACTIVE</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { label: "BPM", value: "72" },
              { label: "EF", value: "62%" },
              { label: "BP", value: "120/80" },
            ].map((s) => (
              <div key={s.label} className="px-1.5 sm:px-2 py-1 rounded bg-background/60 backdrop-blur-sm">
                <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground">{s.label}</p>
                <p className="font-orbitron text-[10px] sm:text-[11px] font-bold text-red-400">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 0.2, 3.5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#fff5f0" />
        <pointLight position={[-3, 2, 3]} intensity={0.5} color="#FF1744" />
        <pointLight position={[3, -2, -3]} intensity={0.3} color="#D50000" />
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#FF5252" />
        <hemisphereLight intensity={0.25} color="#ffeeee" groundColor="#110000" />
        <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.2}>
          <AnatomicalHeart scanning={scanning} />
        </Float>
        <BloodFlow scanning={scanning} />
        <ECGLine scanning={scanning} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={scanning ? 2 : 0.5}
        />
      </Canvas>
    </div>
  );
};

export default Heart3D;
