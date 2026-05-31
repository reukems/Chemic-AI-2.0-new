import React, { useEffect } from 'react';
import LabCanvas from './engine/LabCanvas';
import MainMenu from './ui/MainMenu';
import LoadingScreen from './ui/LoadingScreen';
import UIOverlay from './ui/UIOverlay';
import { useSimulationStore } from './engine/store';

function App() {
  const initialize = useSimulationStore(state => state.initialize);
  const appState = useSimulationStore(state => state.appState);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="w-screen h-screen relative bg-[#0b0f19] overflow-hidden flex flex-col font-sans">
      {appState === 'MENU' && <MainMenu />}
      {appState === 'LOADING' && <LoadingScreen />}

      {/* We always render LabCanvas but keep it hidden/behind if not in WORKBENCH to avoid recreation if needed, or we can conditionalize it.
          For performance and clean state, conditional rendering is better. */}
      {appState === 'WORKBENCH' && (
        <>
          <LabCanvas />
          <UIOverlay />
        </>
      )}
    </div>
  );

}

export default App;
