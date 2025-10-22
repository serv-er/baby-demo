// src/ModelToPlace.js
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei'; // Or use a basic mesh like below

function ModelToPlace({ modelColor, ...props }) {
  const meshRef = useRef();

  // --- Option A: Load a GLB model ---
  // Make sure your model file is in the /public folder
  // const { scene } = useGLTF('/your_model.glb'); // Path relative to /public
  // Apply color (might need to traverse the scene to find the right mesh/material)
  // useEffect(() => {
  //   scene.traverse((child) => {
  //     if (child.isMesh && child.material) {
  //       child.material.color.set(modelColor);
  //     }
  //   });
  // }, [modelColor, scene]);
  // return <primitive object={scene} ref={meshRef} {...props} />;

  // --- Option B: Use a simple Box for testing ---
  // Basic animation example
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} {...props} >
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      {/* Apply the color received via props */}
      <meshStandardMaterial color={modelColor} />
    </mesh>
  );
}

// Optional: Preload GLTF model if using useGLTF
// useGLTF.preload('/your_model.glb');

export default ModelToPlace;