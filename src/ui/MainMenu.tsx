import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../engine/store';

const MainMenu: React.FC = () => {
  const setAppState = useSimulationStore(state => state.setAppState);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Interactive state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dialogue, setDialogue] = useState("System online! Welcome to the Chemic-AI Quantum Engine, Researcher! I'm Professor Lucy. Are we ready to synthesize something amazing today? :3");

  const handleStart = () => {
    setAppState('LOADING');
  };

  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Calculate mouse position relative to center of screen, from -1 to 1
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleHeadPet = () => {
    setDialogue("W-wait, hey! what are you doing? i didn't allow you to ...b-but I suppose this is fine... just don't mess up my ears! >///<");
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-[#0b0f19] text-white flex items-center justify-center overflow-hidden font-sans"
      onMouseMove={handleMouseMove}
    >
      {/* Background styling / Grid */}
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Professor Lucy Interactive Container */}
      <div
        className="absolute right-0 bottom-0 h-[90vh] w-[50vw] transition-transform duration-100 ease-out origin-bottom-right"
        style={{
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -10}px) rotate(${mousePos.x * 1.5}deg) scale(1.02)`,
        }}
      >
        <img
          src="/assets/lucy-transparent.png"
          alt="Professor Lucy"
          className="object-contain h-full w-full object-right-bottom drop-shadow-[-10px_0_20px_rgba(34,197,94,0.15)] pointer-events-none"
        />

        {/* Head hit box for interaction */}
        <div
          onClick={handleHeadPet}
          className="absolute top-[10%] left-[35%] w-[30%] h-[30%] cursor-pointer z-50"
          style={{ borderRadius: '50%' }}
          title="Pet head"
        />

        {/* Chat Box */}
        <div className="absolute top-[30%] left-[0%] w-[300px] bg-[#111827]/90 border border-emerald-500/50 rounded-xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {/* Chat bubble tail */}
          <div className="absolute right-[-10px] top-[20px] w-0 h-0 border-t-[10px] border-t-transparent border-l-[10px] border-l-[#111827]/90 border-b-[10px] border-b-transparent z-10"></div>
          <div className="absolute right-[-12px] top-[19px] w-0 h-0 border-t-[11px] border-t-transparent border-l-[11px] border-l-emerald-500/50 border-b-[11px] border-b-transparent z-0"></div>

          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-emerald-400">Prof. Lucy</span>
            <span className="text-xs text-emerald-500/50 font-mono">AI_CORE_ACTIVE</span>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed font-medium">
            {dialogue}
          </p>
        </div>
      </div>

      <div className="z-10 w-full max-w-5xl px-8 flex flex-col justify-center h-full">
        <div className="mb-12">
          {/* Online Indicator */}
          <div className="flex items-center gap-2 mb-4 text-green-400 font-mono text-sm tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping shadow-[0_0_8px_#22c55e]"></div>
            <span>SYSTEM ONLINE</span>
          </div>

          {/* Title with Gradient Animation */}
          <h1 className="text-7xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-[#00ff87] via-[#60efff] to-[#0061ff] text-transparent bg-clip-text animate-[gradient_3s_ease_infinite]"
              style={{ backgroundSize: '300% auto' }}>
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
