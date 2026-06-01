import React, { useState } from 'react';
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
      className="absolute inset-0 z-50 bg-[#080b13] text-white flex items-center justify-start overflow-hidden font-sans selection:bg-emerald-500/30"
      onMouseMove={handleMouseMove}
    >
      {/* Background vignette & ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#080b13_100%)] pointer-events-none z-10" />
      <div className="absolute top-0 right-[20%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Professor Lucy Interactive Container (Full Bleed AAA Style) */}
      <div
        className="absolute right-[-10vw] bottom-[-5vh] h-[110vh] w-[80vw] transition-transform duration-300 ease-out z-0 origin-bottom"
        style={{
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -15}px) rotate(${mousePos.x * 0.5}deg)`,
        }}
      >
        <img
          src="/assets/lucy-transparent.png"
          alt="Professor Lucy"
          className="object-cover h-full w-full object-bottom drop-shadow-[-20px_0_40px_rgba(16,185,129,0.15)] pointer-events-none scale-110"
        />

        {/* Head hit box for interaction */}
        <div
          onClick={handleHeadPet}
          className="absolute top-[10%] left-[30%] w-[40%] h-[30%] cursor-pointer z-50 rounded-full"
          title="Pet head"
        />

        {/* Chat Box / Subtitles */}
        <div
          className="absolute top-[45%] left-[-15%] w-[400px] bg-black/60 border-l-4 border-emerald-500 p-6 backdrop-blur-xl transform -translate-y-1/2 pointer-events-none shadow-2xl"
          style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="font-black text-emerald-400 tracking-widest uppercase text-sm">Prof. Lucy</span>
            <div className="flex-1 h-[1px] bg-emerald-500/30"></div>
          </div>
          <p className="text-gray-100 text-base leading-relaxed font-medium italic">
            "{dialogue}"
          </p>
        </div>
      </div>

      {/* UI Overlay - Left Side */}
      <div className="z-20 w-full max-w-7xl px-16 flex flex-col justify-center h-full pointer-events-none">

        <div className="w-[45vw] pointer-events-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-500/80 font-mono text-sm tracking-[0.3em] uppercase">System Verified</span>
            </div>

            <h1
              className="text-[6rem] leading-none font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              style={{ backgroundSize: '200% 200%', animation: 'rgb-shift 5s ease infinite' }}
            >
              CHEMIC<span className="text-emerald-500">_</span>AI
            </h1>
            <p className="text-gray-400/80 text-xl tracking-widest uppercase font-light border-l-2 border-emerald-500/50 pl-4">
              Quantum Lab Environment
            </p>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-6 w-[400px]">
            <button
              onClick={handleStart}
              onMouseEnter={() => setHoveredButton('START')}
              onMouseLeave={() => setHoveredButton(null)}
              className="group relative px-8 py-5 bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 rounded-none text-left overflow-hidden transition-all duration-500 backdrop-blur-sm"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 group-hover:w-full transition-all duration-500 ease-out opacity-20 z-0"></div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-black text-2xl text-white tracking-widest uppercase">Start Engine</span>
                <span className={`font-mono text-emerald-400 transition-opacity duration-300 ${hoveredButton === 'START' ? 'opacity-100' : 'opacity-0'}`}>
                  [ ENTER ]
                </span>
              </div>
            </button>

            <div className="flex flex-col gap-2 mt-4 pl-4 border-l border-white/10">
              {['Story Archives', 'Element Database', 'System Settings', 'Exit Desktop'].map((label, i) => (
                <button
                  key={label}
                  onMouseEnter={() => setHoveredButton(label)}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleDisabledClick}
                  className="relative px-4 py-3 text-left transition-all overflow-hidden flex items-center justify-between group opacity-60 hover:opacity-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-500">0{i+1}</span>
                    <span className="text-gray-300 font-bold tracking-widest uppercase text-sm group-hover:text-emerald-400 transition-colors">
                      {label}
                    </span>
                  </div>

                  <span className={`text-[10px] text-yellow-500/80 font-mono tracking-widest uppercase transition-all duration-300 ${hoveredButton === label ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    Locked
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MainMenu;
