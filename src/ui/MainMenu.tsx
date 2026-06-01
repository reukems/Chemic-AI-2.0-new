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
      className="absolute inset-0 z-50 bg-[#0b0f19] text-white flex items-center justify-start overflow-hidden font-sans selection:bg-cyan-500/30"
      onMouseMove={handleMouseMove}
    >
      {/* Background vignette & ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0b0f19_100%)] pointer-events-none z-10" />
      <div className="absolute top-0 right-[20%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Professor Lucy Interactive Container (Massive Miside Style) */}
      <div
        className="absolute right-[-15vw] bottom-[-20vh] h-[140vh] w-[100vw] transition-transform duration-300 ease-out z-0 origin-bottom"
        style={{
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -15}px) rotate(${mousePos.x * 0.5}deg)`,
        }}
      >
        <img
          src="/assets/lucy-transparent.png"
          alt="Professor Lucy"
          className="object-cover h-full w-full object-bottom drop-shadow-[-20px_0_40px_rgba(34,211,238,0.15)] pointer-events-none scale-125"
        />

        {/* Head hit box for interaction */}
        <div
          onClick={handleHeadPet}
          className="absolute top-[15%] left-[35%] w-[30%] h-[30%] cursor-pointer z-50 rounded-full"
          title="Pet head"
        />

        {/* Chat Box / Subtitles */}
        <div
          className="absolute top-[55%] left-[10%] w-[450px] bg-[#171c28]/90 border border-[#2dd4bf]/30 p-6 rounded-xl backdrop-blur-xl transform -translate-y-1/2 pointer-events-none shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400">
              <img src="/assets/lucy-transparent.png" className="w-full h-full object-cover object-top scale-150" alt="Avatar" />
            </div>
            <span className="font-bold text-white tracking-wide text-sm">Commlink - PROF. LUCY</span>
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
              <span className="text-[#10b981] text-xs font-bold tracking-widest">ONLINE</span>
            </div>
          </div>
          <div className="w-full h-[1px] bg-white/10 mb-4"></div>
          <p className="text-gray-200 text-base leading-relaxed">
            {dialogue}
          </p>
        </div>
      </div>

      {/* UI Overlay - Left Side */}
      <div className="z-20 w-full max-w-7xl px-16 flex flex-col justify-center h-full pointer-events-none">

        <div className="w-[45vw] pointer-events-auto">
          {/* Header */}
          <div className="mb-12 bg-[#171c28]/80 border border-[#2dd4bf]/20 p-8 rounded-2xl backdrop-blur-md inline-block shadow-lg">
            <h1
              className="text-[4.5rem] leading-none font-black tracking-widest mb-2 uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] via-[#10b981] to-[#2dd4bf] animate-[rgb-shift_3s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              CHEMIC-AI
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <p className="text-gray-300 text-sm tracking-[0.2em] uppercase font-bold">
                Quantum Reality Engine
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-4 w-[400px]">
            <button
              onClick={handleStart}
              onMouseEnter={() => setHoveredButton('START')}
              onMouseLeave={() => setHoveredButton(null)}
              className="group relative px-6 py-5 bg-[#171c28]/80 border border-[#2dd4bf]/30 hover:bg-[#1e2433] hover:border-cyan-400 rounded-xl text-left overflow-hidden transition-all duration-300 backdrop-blur-sm shadow-lg"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-cyan-400 group-hover:w-full transition-all duration-500 ease-out opacity-10 z-0"></div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-bold text-xl text-white tracking-widest uppercase">Start Engine</span>
                <span className={`font-mono text-cyan-400 transition-opacity duration-300 ${hoveredButton === 'START' ? 'opacity-100' : 'opacity-0'}`}>
                  [ ENTER ]
                </span>
              </div>
            </button>

            <div className="flex flex-col gap-3 mt-2">
              {['Story Archives', 'Element Database', 'System Settings', 'Exit Desktop'].map((label, i) => (
                <button
                  key={label}
                  onMouseEnter={() => setHoveredButton(label)}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleDisabledClick}
                  className="relative px-6 py-4 bg-[#171c28]/50 border border-white/5 rounded-xl text-left transition-all overflow-hidden flex items-center justify-between group opacity-80 hover:opacity-100 hover:border-cyan-400/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-cyan-500/50">0{i+1}</span>
                    <span className="text-gray-300 font-bold tracking-widest uppercase text-sm group-hover:text-cyan-400 transition-colors">
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
