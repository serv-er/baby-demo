// src/ZapparARComponent.js
import React, { useRef, useState, Suspense } from 'react';
import {
  ZapparCanvas,
  ZapparCamera,
  InstantTracker,
  Loader
} from '@zappar/zappar-react-three-fiber';

// Import your custom components
import ModelToPlace from './ModelToPlace';
import InteractiveUI from './InteractiveUI';

function ZapparARComponent() {
  const instantTrackerRef = useRef();
  const [isPlaced, setIsPlaced] = useState(false);
  // State for the model's color, controlled by the UI
  const [modelColor, setModelColor] = useState('hotpink'); // Default color

  const handlePlaceClick = () => {
    if (instantTrackerRef.current) {
      instantTrackerRef.current.setAnchorPoseFromCameraOffset(0, 0, -4); // Place 4 units in front
      setIsPlaced(true);
      console.log('Content Placed!');
    }
  };

  return (
    <>
      <ZapparCanvas style={{ position: 'absolute', top: 0, left: 0 }}>
     
        <Loader />
        <ZapparCamera />

        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 8, 5]} intensity={0.8} />

        {/* InstantTracker anchors content to the real world */}
        <InstantTracker
          ref={instantTrackerRef}
          // Only allow placement clicks when not already placed
          placementMode={!isPlaced}
        >
          {/* Main 3D Model */}
          <Suspense fallback={null}>
            <ModelToPlace
              position={[0, 0, 0]} // Position relative to the anchor (center)
              modelColor={modelColor} // Pass color state
            />
          </Suspense>

          {/* In-World Interactive UI */}
          <InteractiveUI
             // Position UI relative to the anchor (e.g., slightly above the model)
            position={[0, 1.0, 0]}
            setModelColor={setModelColor} // Pass the setter function
          />

        </InstantTracker>
      </ZapparCanvas>

      {/* HTML Button to trigger initial placement */}
      {!isPlaced && (
           <button onClick={handlePlaceClick} className="place-button">
             Tap to Place Model
           </button>
      )}

      {/* Basic CSS for the button */}
      <style>{`
        .place-button {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          font-size: 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          z-index: 10;
          cursor: pointer;
        }
        .place-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </>
  );
}

export default ZapparARComponent;