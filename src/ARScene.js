import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, useScene } from 'react-babylonjs';
import { Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3, WebXRState } from '@babylonjs/core'; // Import WebXRState if needed for catch block

// This component contains the main logic for our AR scene
const ARSceneContainer = ({ setErrorToast }) => {
  const scene = useScene();
  
  useEffect(() => {
    if (scene) {
      // Basic scene setup
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      
      // Async function to initialize WebXR
      const initializeXR = async () => {
        let xr = null; // Declare xr here so it's accessible in catch blocks
        try {
          // Create the default WebXR experience
          xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: { sessionMode: 'immersive-ar' },
            optionalFeatures: true // Tries to get features like hand-tracking if available
          });

          // Check if XR session itself is supported
          if (!xr.baseExperience) {
            console.error("WebXR baseExperience not available. AR not supported?");
            setErrorToast("AR not supported on this device.");
            return;
          }

          const featuresManager = xr.baseExperience.featuresManager;
          
          // --- NEW ROBUST FEATURE ENABLING ---
          let xrHitTest = null; // Initialize to null
          
          // Try to enable Hit-Test
          try {
            xrHitTest = featuresManager.enableFeature('hit-test', 'latest');
            console.log("Hit-test feature enabled successfully.");
          } catch (hitTestErr) {
            console.error("Hit-test feature failed to enable:", hitTestErr);
            // Show toast BUT DON'T STOP - Plane Detection might still work
            setErrorToast("AR Feature Error: Hit-test not available."); 
            // We set xrHitTest to null, so the placing logic won't run
          }

          // Try to enable Plane Detection (only if hit-test succeeded or failed gracefully)
          try {
            const xrPlaneDetector = featuresManager.enableFeature('plane-detection', 'latest');
            console.log("Plane-detection feature enabled successfully.");
          } catch (planeErr) {
             console.error("Plane-detection feature failed to enable:", planeErr);
             // Check if hit-test also failed to avoid double toast
             if (xrHitTest) { // Only show plane error if hit-test didn't already show an error
                setErrorToast("AR Feature Error: Plane-detection not available.");
             }
             // Continue anyway, hit-test might still work
          }
          // --- END NEW ROBUST FEATURE ENABLING ---


          // --- Place an object on tap (only if hit-test was enabled) ---
          scene.onPointerDown = (evt, pickInfo) => {
            // Check if xrHitTest was successfully enabled AND we have a result
            if (xrHitTest && xrHitTest.lastHitTestResult) { 
                const box = MeshBuilder.CreateBox("placedBox", { size: 0.1 }, scene);
                box.position = xrHitTest.lastHitTestResult.position;
                const material = new StandardMaterial("boxMaterial", scene);
                material.diffuseColor = Color3.Teal();
                box.material = material;
            } else if (!xrHitTest) {
                console.log("Tap ignored: Hit-test feature is not available.");
                // Optionally show a toast here too if hit-test failed
                // setErrorToast("Cannot place object: Hit-test unavailable.");
            }
          };

        } catch (generalError) {
          // Catch errors during session creation itself
          console.error("Error initializing WebXR session:", generalError);
           if (generalError.message && (generalError.message.toLowerCase().includes("not supported") || generalError.message.toLowerCase().includes("not found"))) {
            setErrorToast("AR Session Error: Mode not supported.");
          } else {
             setErrorToast("Error starting AR. Is ARCore installed & updated?");
          }
          
          // Try to exit XR if it partially started
          // Note: Check BABYLON namespace if using UMD, otherwise use imported WebXRState
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
    // Make sure setErrorToast is in the dependency array
  }, [scene, setErrorToast]); 

  return null; // This component doesn't render any DOM elements itself
};


// This is the main component that sets up the Engine, Scene, and Toast
// This part remains unchanged from your previous working version
const ARScene = () => {
  // State to hold the error message
  const [errorToast, setErrorToast] = useState('');

  return (
    // Use React.Fragment (<>) to hold both the toast and the scene
    <>
      {/* This is the Toast UI. It only shows if errorToast has a message. */}
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
            {/* Pass the setter function down to the container */}
            <ARSceneContainer setErrorToast={setErrorToast} />
          </Scene>
        </Engine>
      </div>
    </>
  );
};

export default ARScene;
