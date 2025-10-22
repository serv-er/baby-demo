// src/InteractiveUI.js
import React, { useState } from 'react';
import * as THREE from 'three';

function InteractiveUI({ setModelColor, ...props }) {
  const [hoveredButton, setHoveredButton] = useState(null); // State to track hover

  const handlePointerOver = (e, colorName) => {
    e.stopPropagation(); // Prevent event bubbling
    setHoveredButton(colorName);
    document.body.style.cursor = 'pointer'; // Change cursor on hover
  };

  const handlePointerOut = (e) => {
    setHoveredButton(null);
    document.body.style.cursor = 'default'; // Reset cursor
  };

  return (
    // Group to hold all UI elements, positioned relative to the main model anchor
    <group {...props}>
      {/* Red Button */}
      <mesh
        position={[-0.5, 0, 0]} // Position left of the center
        onClick={(e) => { e.stopPropagation(); setModelColor('red'); }}
        onPointerOver={(e) => handlePointerOver(e, 'red')}
        onPointerOut={handlePointerOut}
        scale={hoveredButton === 'red' ? 1.2 : 1} // Scale up on hover
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" emissive={hoveredButton === 'red' ? 'darkred' : 'black'} />
      </mesh>

      {/* Blue Button */}
      <mesh
        position={[0.5, 0, 0]} // Position right of the center
        onClick={(e) => { e.stopPropagation(); setModelColor('blue'); }}
        onPointerOver={(e) => handlePointerOver(e, 'blue')}
        onPointerOut={handlePointerOut}
        scale={hoveredButton === 'blue' ? 1.2 : 1}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="blue" emissive={hoveredButton === 'blue' ? 'darkblue' : 'black'} />
      </mesh>

      {/* Add more buttons/elements here (e.g., for size) */}
    </group>
  );
}

export default InteractiveUI;