import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, useScene } from 'react-babylonjs';
import { Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3, WebXRState } from '@babylonjs/core';

// This component contains the main logic for our AR scene
const ARSceneContainer = ({ setErrorToast }) => {
  const scene = useScene();
  
  useEffect(() => {
    if (scene) {
      // Basic scene setup
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      
      // Async function to initialize WebXR
      const initializeXR = async () => {
        let xr = null; 
        try {
          // --- CHANGE HERE: Explicitly require the features ---
          xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: { 
              sessionMode: 'immersive-ar',
            },
            // Instead of optionalFeatures: true, list the ones we absolutely need
            optionalFeatures: [ // Still list optional ones like hand-tracking if desired
               "hand-tracking" 
            ],
             requiredFeatures: [ // Add this new array
               "hit-test",
               "plane-detection",
             ]
          });
          // --- END CHANGE ---

          // Check if XR session itself is supported
          if (!xr.baseExperience) {
            console.error("WebXR baseExperience not available. AR not supported?");
            setErrorToast("AR not supported on this device.");
            return;
          }

          const featuresManager = xr.baseExperience.featuresManager;
          
          // Get references to the features (they should exist since they were required)
          const xrHitTest = featuresManager.getFeature('hit-test');
          const xrPlaneDetector = featuresManager.getFeature('plane-detection');

          // Add extra checks just in case the required features somehow failed anyway
          if (!xrHitTest) {
             console.error("Required feature 'hit-test' is missing after session start!");
             setErrorToast("AR Error: Hit-test feature failed.");
             // Potentially exit XR or disable interaction
             return; 
          }
           if (!xrPlaneDetector) {
             console.error("Required feature 'plane-detection' is missing after session start!");
             setErrorToast("AR Error: Plane-detection feature failed.");
             // Potentially exit XR or disable interaction
             // Depending on your app logic, you might continue without planes
           }

          console.log("Hit-test and Plane-detection features obtained successfully.");

          // --- Place an object on tap (using the obtained xrHitTest) ---
          scene.onPointerDown = (evt, pickInfo) => {
            // Check if xrHitTest exists AND we have a result
            if (xrHitTest && xrHitTest.lastHitTestResult) { 
                const box = MeshBuilder.CreateBox("placedBox", { size: 0.1 }, scene);
                box.position = xrHitTest.lastHitTestResult.position;
                const material = new StandardMaterial("boxMaterial", scene);
                material.diffuseColor = Color3.Teal();
                box.material = material;
            } else {
                console.log("Tap ignored: Hit-test feature might be missing or no surface found.");
            }
          };

        } catch (generalError) {
          // Catch errors during session creation (e.g., if required features AREN'T supported)
          console.error("Error initializing WebXR session:", generalError);
           if (generalError.message && (generalError.message.toLowerCase().includes("not supported") || generalError.message.toLowerCase().includes("invalid requiredfeatures"))) {
            setErrorToast("AR Error: Required features (hit-test/planes) not supported on this device/browser.");
          } else {
             setErrorToast("Error starting AR. Is ARCore installed & updated?");
          }
          
          // Try to exit XR if it partially started
          if (xr && xr.baseExperience && xr.baseExperience.state === WebXRState.IN_XR) { 
             try {
               await xr.baseExperience.exitXRAsync();
             } catch (exitError) {
               console.error("Error trying to exit XR after initial failure:", exitError);
             }
          }
        }
      };

      initializeXR();
    }
  }, [scene, setErrorToast]); 

  return null; 
};


// --- The rest of the ARScene component (useState, Toast UI, Engine, Scene) remains the same ---
const ARScene = () => {
  const [errorToast, setErrorToast] = useState('');

  return (
    <>
      {errorToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(211, 47, 47, 0.9)', 
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
      <div style={{ flex: 1, display: 'flex' }}>
        <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
          <Scene>
            <ARSceneContainer setErrorToast={setErrorToast} />
          </Scene>
        </Engine>
      </div>
    </>
  );
};

export default ARScene;

