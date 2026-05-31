import React, { useState } from 'react';
import { useSimulationStore } from '../engine/store';

const MainMenu: React.FC = () => {
  const setAppState = useSimulationStore(state => state.setAppState);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleStart = () => {
    setAppState('LOADING');
  };

  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real app we might show a toast, but we can also handle it simply
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0b0f19] text-white flex items-center justify-center overflow-hidden font-sans">
      {/* Background styling / Grid */}
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Professor Lucy Image */}
      <div className="absolute right-0 bottom-0 h-[90vh] w-[50vw] pointer-events-none opacity-90 transition-transform duration-[3s] ease-out hover:scale-105 origin-bottom-right">
        {/* We use the transparent asset */}
        <img
          src="/assets/lucy-transparent.png"
          alt="Professor Lucy"
          className="object-contain h-full w-full object-right-bottom drop-shadow-[-10px_0_20px_rgba(34,197,94,0.15)]"
        />
      </div>

      <div className="z-10 w-full max-w-5xl px-8 flex flex-col justify-center h-full">
        <div className="mb-12">
          {/* Online Indicator */}
          <div className="flex items-center gap-2 mb-4 text-green-400 font-mono text-sm tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping shadow-[0_0_8px_#22c55e]"></div>
            <span>SYSTEM ONLINE</span>
          </div>

          {/* Title with Gradient Animation */}
          <h1 className="text-7xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 text-transparent bg-clip-text"
              style={{ backgroundSize: '200% auto', animation: 'gradient 4s linear infinite' }}>
            CHEMIC-AI
          </h1>
          <p className="text-gray-400 text-lg tracking-wide max-w-md">
            Interactive virtual laboratory environment.
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={handleStart}
            className="group relative px-6 py-4 bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-500/30 hover:border-emerald-400 rounded-lg text-left overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 group-hover:w-2 transition-all"></div>
            <span className="font-bold text-emerald-100 tracking-wider relative z-10 pl-2">Begin Simulation</span>
          </button>

          <div className="h-px w-full bg-gray-800 my-2"></div>

          {['Story Mode', 'Database', 'Calibration', 'Research Notes'].map((label) => (
            <button
              key={label}
              onMouseEnter={() => setHoveredButton(label)}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={handleDisabledClick}
              className="relative px-6 py-3 border border-transparent hover:border-gray-700 hover:bg-gray-800/50 rounded text-left transition-all overflow-hidden flex items-center justify-between group"
            >
              <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>

              {/* Coming Soon indicator that slides in */}
              <span className={`text-xs text-yellow-500/80 font-mono bg-yellow-500/10 px-2 py-1 rounded transition-all duration-300 ${hoveredButton === label ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                Coming Soon
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default MainMenu;
