import React from 'react';
import LabCanvas from './engine/LabCanvas';
import UIOverlay from './ui/UIOverlay';
import { useSimulationStore } from './engine/store';

function App() {
  const { initialize } = useSimulationStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="w-screen h-screen relative bg-slate-900 overflow-hidden">
      {/* 2D Canvas Engine for rendering beakers and reactions */}
      <LabCanvas />

      {/* UI Overlay for AI Chat, Inventory, and Controls */}
      <UIOverlay />
    </div>
  );
}

export default App;