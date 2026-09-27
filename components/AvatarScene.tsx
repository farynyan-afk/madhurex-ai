"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

type AvatarProps = {
  status?: "idle" | "listening" | "thinking" | "speaking";
};

function Core({ status }: AvatarProps) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!group.current || !ring.current) return;

    const time = state.clock.elapsedTime;

    group.current.rotation.y = Math.sin(time * 0.5) * 0.18;
    group.current.rotation.x = Math.sin(time * 0.35) * 0.05;

    const intensity =
      status === "listening" ? 1.35 : status === "speaking" ? 1.2 : 0.8;

    ring.current.rotation.z += 0.006 * intensity;
    ring.current.scale.setScalar(
      1 + Math.sin(time * (status === "thinking" ? 4 : 2)) * 0.035,
    );
  });

  const accent =
    status === "listening"
      ? "#5ee7ff"
      : status === "thinking"
        ? "#a78bfa"
        : status === "speaking"
          ? "#f0abfc"
          : "#71f6df";

  return (
    <group ref={group}>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          thickness={0.8}
          roughness={0.08}
          chromaticAberration={0.08}
          color={accent}
          emissive={accent}
          emissiveIntensity={0.22}
        />
      </mesh>

      <mesh position={[0, 0.4, 1.03]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-0.35, 0.4, 0.98]}>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      <mesh position={[0.35, 0.4, 0.98]}>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.018, 16, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.75} />
      </mesh>

      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 0.65, 32]} />
        <meshStandardMaterial
          color="#111a31"
          metalness={0.8}
          roughness={0.2}
          emissive={accent}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

export default function AvatarScene({ status = "idle" }: AvatarProps) {
  return (
    <div className="h-[360px] w-full md:h-[460px]">
      <Canvas camera={{ position: [0, 0.25, 4.5], fov: 42 }}>
        <ambientLight intensity={0.65} />
        <pointLight position={[2, 3, 4]} intensity={12} color="#5ee7ff" />
        <pointLight position={[-3, 1, 2]} intensity={8} color="#a78bfa" />

        <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.4}>
          <Core status={status} />
        </Float>

        <Sparkles
          count={70}
          scale={[5, 4, 5]}
          size={1.4}
          speed={0.3}
          color="#8be9ff"
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.7}
        />
      </Canvas>
    </div>
  );
}