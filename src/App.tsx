import React, { useEffect } from 'react';
import LabCanvas from './engine/LabCanvas';
import UIOverlay from './ui/UIOverlay';
import { useSimulationStore } from './engine/store';

function App() {
  const initialize = useSimulationStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="w-screen h-screen relative bg-[#0b0f19] overflow-hidden flex flex-col font-sans">
      <LabCanvas />
      <UIOverlay />
    </div>
  );
}

export default App;
