import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../engine/store';

const LoadingScreen: React.FC = () => {
  const setAppState = useSimulationStore(state => state.setAppState);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading process
    const duration = 2500; // 2.5 seconds loading
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setAppState('WORKBENCH');
        }, 300); // small delay after reaching 100%
      }
    }, interval);

    return () => clearInterval(timer);
  }, [setAppState]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f19] text-green-400 font-mono">
      <div className="w-64">
        <h2 className="text-xl mb-4 tracking-widest text-center animate-pulse">
          INITIALIZING...
        </h2>
        <div className="w-full h-2 bg-gray-800 rounded overflow-hidden relative">
          <div
            className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
            style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-right text-green-500 opacity-70">
          {Math.floor(progress)}%
        </div>
      </div>

      {/* Decorative tech elements */}
      <div className="absolute bottom-10 left-10 text-xs opacity-50 space-y-1">
        <p>Sys_Diag: OK</p>
        <p>Mem_Bank: ALLOCATED</p>
        <p>Core_Temp: STABLE</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
