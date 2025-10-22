import React, { useEffect, useRef, useState } from 'react'; // <-- 1. Import useState
import { Engine, Scene, useScene } from 'react-babylonjs';
import { Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';

// This component contains the main logic for our AR scene
// We now pass in 'setErrorToast' as a prop
const ARSceneContainer = ({ setErrorToast }) => { // <-- 2. Accept prop
  const scene = useScene();
  
  useEffect(() => {
    if (scene) {
      // Basic scene setup
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      
      // Async function to initialize WebXR
      const initializeXR = async () => {
        try {
          // Create the default WebXR experience
          const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
              sessionMode: 'immersive-ar',
            },
            optionalFeatures: true
          });

          // Check if XR is supported
          if (!xr.baseExperience) {
            console.error("WebXR not supported in this browser.");
            setErrorToast("AR not supported on this device."); // <-- 3. Set user-friendly error
            return;
          }

          // Get the feature managers
          const featuresManager = xr.baseExperience.featuresManager;

          // Enable Hit-Testing
          const xrHitTest = featuresManager.enableFeature('hit-test', 'latest');

          // Enable Plane Detection
          const xrPlaneDetector = featuresManager.enableFeature('plane-detection', 'latest');

          // --- Place an object on tap ---
          scene.onPointerDown = (evt, pickInfo) => {
            if (xrHitTest.lastHitTestResult) {
                const box = MeshBuilder.CreateBox("placedBox", { size: 0.1 }, scene);
                box.position = xrHitTest.lastHitTestResult.position;
                const material = new StandardMaterial("boxMaterial", scene);
                material.diffuseColor = Color3.Teal();
                box.material = material;
            }
          };

        } catch (error) {
          console.error("Error initializing WebXR:", error);
          // 4. Catch any other errors and show a toast
          if (error.message && (error.message.includes("not supported") || error.message.includes("not found"))) {
            setErrorToast("AR not supported on this device.");
          } else {
            setErrorToast("An error occurred while starting AR.");
          }
        }
      };

      initializeXR();
    }
  }, [scene, setErrorToast]); // <-- 5. Add setErrorToast to dependency array

  return null;
};

// This is the main component that sets up the Engine, Scene, and Toast
const ARScene = () => {
  // 6. State to hold the error message
  const [errorToast, setErrorToast] = useState('');

  return (
    // 7. Use React.Fragment (<>) to hold both the toast and the scene
    <>
      {/* 8. This is the Toast UI. It only shows if errorToast has a message. */}
      {errorToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(211, 47, 47, 0.9)', // Red color for error
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1000,
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {errorToast}
        </div>
      )}

      {/* This is the Babylon Scene */}
      <div style={{ flex: 1, display: 'flex' }}>
        <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
          <Scene>
            {/* 9. Pass the setter function down to the container */}
            <ARSceneContainer setErrorToast={setErrorToast} />
          </Scene>
        </Engine>
      </div>
    </>
  );
};

export default ARScene;