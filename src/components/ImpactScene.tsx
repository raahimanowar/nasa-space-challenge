// components/ImpactScene.tsx
'use client';
import React, { Suspense, useRef, useState, useEffect, JSX } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';


// eslint-disable-next-line 
type GLTFResult = any;

function EarthGLB({ impacted }: { impacted: boolean }) {
  // load both intact and cracked scenes
  const intact = useGLTF('/models/earth.glb') as GLTFResult;
//   const cracked = useGLTF('/models/earth-cracked.glb') as GLTFResult;
  const groupRef = useRef<THREE.Group | null>(null);
  const centeredRef = useRef(false);

  // center both models once after load (so they render at origin)
  useEffect(() => {
    if (centeredRef.current) return;

    const centerScene = (scene: THREE.Object3D) => {
      // compute bounding box and center the scene at origin
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);
      // optional: scale to fit if necessary
      // const size = box.getSize(new THREE.Vector3());
      // const max = Math.max(size.x, size.y, size.z);
      // if (max > 0) scene.scale.setScalar(2.0 / max);
    };

    if (intact?.scene) centerScene(intact.scene);
    // if (cracked?.scene) centerScene(cracked.scene);

    centeredRef.current = true;
  }, [intact]);

  // faster axial rotation
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.8; // faster rotate
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* swap the primitive rendered based on impacted flag */}
      {/* {impacted ? <primitive object={cracked.scene} dispose={null} /> : <primitive object={intact.scene} dispose={null} />} */}
      <primitive object={intact.scene} dispose={null} />
    </group>
  );
}

function SimpleAsteroid({
  start = new THREE.Vector3(3.8, 3.2, 2.8),
  target = new THREE.Vector3(0, 0, 0),
  speed = 3.2,
  impactDistance = 1.05,
  onImpact,
}: {
  start?: THREE.Vector3;
  target?: THREE.Vector3;
  speed?: number;
  impactDistance?: number;
  onImpact: () => void;
}) {
  const ref = useRef<THREE.Mesh | null>(null);
  const dir = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.position.copy(start);
      dir.current.subVectors(target, start).normalize();
      initialized.current = true;
    }
  }, [start, target]);

  useFrame((_, dt) => {
    if (!ref.current || !initialized.current) return;

    // straight-line motion
    ref.current.position.addScaledVector(dir.current, speed * dt);

    // slow tumble for visual
    ref.current.rotation.x += dt * 2.2;
    ref.current.rotation.y += dt * 1.7;

    // collision check
    const d = ref.current.position.distanceTo(target);
    if (d <= impactDistance) {
      onImpact();
    }
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[0.18, 20, 20]} />
      <meshStandardMaterial color={'#7b5e3a'} roughness={1} metalness={0} />
    </mesh>
  );
}

export default function ImpactScene(): JSX.Element {
  const [active, setActive] = useState(true); // toggles asteroid mount
  const [impacted, setImpacted] = useState(false);
  const [loop] = useState(true);

  // preload glbs
  useEffect(() => {
    useGLTF.preload('/models/earth.glb');
    // useGLTF.preload('/models/earth-cracked.glb');
  }, []);

  function handleImpact() {
    if (impacted) return;
    setImpacted(true);
    // unmount asteroid immediately so it doesn't linger/clamp through surface
    setActive(false);

    // revert back after a delay if looping
    if (loop) {
      window.setTimeout(() => {
        setImpacted(false);
        // remount asteroid to start a new run
        setActive(true);
      }, 2600); // 2.6s hold of cracked model
    }
  }

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

        <Suspense fallback={null}>
          <EarthGLB impacted={impacted} />

          {/* mount asteroid only while active so it resets on remount */}
          {active && (
            <SimpleAsteroid
              start={new THREE.Vector3(3.8, 3.2, 2.8)} // start farther top-right
              target={new THREE.Vector3(0, 0, 0)}
              speed={3.2}
              impactDistance={1.05}
              onImpact={handleImpact}
            />
          )}

          {/* <Stars radius={100} depth={40} count={1500} factor={4} fade /> */}
        </Suspense>
      </Canvas>
    </div>
  );
}
