import React, { useState, useEffect, useMemo } from 'react';
import { useSimulationStore } from '../engine/store';
import { motion, AnimatePresence } from 'framer-motion';

const MainMenu: React.FC = () => {
  const setAppState = useSimulationStore(state => state.setAppState);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dialogue, setDialogue] = useState("System online! Welcome to the Chemic-AI Quantum Engine, Researcher! I'm Professor Lucy. Are we ready to synthesize something amazing today? :3");
  const [displayedText, setDisplayedText] = useState("");

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(dialogue.slice(0, i));
      i++;
      if (i > dialogue.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [dialogue]);

  const handleStart = () => {
    setAppState('LOADING');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleHeadPet = () => {
    setDialogue("W-wait, hey! what are you doing? i didn't allow you to ...b-but I suppose this is fine... just don't mess up my ears! >///<");
  };

  // Generate particles
  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => {
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 10;
    const opacity = Math.random() * 0.4 + 0.1;

    return (
      <motion.div
        key={i}
        className="absolute rounded-full bg-cyan-400 pointer-events-none"
        style={{
          width: size,
          height: size,
          left: `${left}%`,
          bottom: '-5%',
          opacity
        }}
        animate={{
          y: ['0vh', '-105vh'],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          delay: delay
        }}
      />
    );
  }), []);

  return (
    <div
      className="absolute inset-0 z-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#05131f] to-[#01050a] text-white flex items-center justify-start overflow-hidden font-sans selection:bg-[#00f3ff]/30"
      onMouseMove={handleMouseMove}
    >
      {/* Particle Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles}
      </div>

      {/* Professor Lucy Interactive Container */}
      <motion.div
        className="absolute right-0 bottom-0 h-screen w-[70vw] z-10 origin-bottom pointer-events-none"
        animate={{
            x: mousePos.x * -20,
            rotate: mousePos.x * 0.3
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {/* CRITICAL SPATIAL FIX */}
        <img
          src="/assets/lucy-transparent.png"
          alt="Professor Lucy"
          className="object-contain h-full w-full drop-shadow-[-20px_0_50px_rgba(34,211,238,0.2)] pointer-events-none absolute bottom-0 right-0"
          style={{ objectPosition: 'bottom right' }}
          onError={(e) => {
             (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Head hit box for interaction */}
        <div
          onClick={handleHeadPet}
          className="absolute top-[20%] right-[30%] w-[15%] h-[20%] cursor-pointer z-50 rounded-full pointer-events-auto"
          title="Pet head"
        />

        {/* Chat Box / Subtitles */}
        <AnimatePresence mode="wait">
            <motion.div
              key={dialogue}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="absolute bottom-[20%] right-[25%] w-[480px] bg-[#05131f]/80 border-t border-l border-[#00f3ff]/50 p-6 rounded-2xl backdrop-blur-xl shadow-[0_0_30px_rgba(0,243,255,0.1)] z-50 overflow-hidden pointer-events-auto"
            >
              <div className="relative z-20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)] bg-[#05131f]">
                      <img src="/assets/lucy-transparent.png" className="w-full h-full object-cover object-[center_20%] scale-[2.5]" alt="Avatar" />
                    </div>
                    <div>
                        <span className="font-bold text-white tracking-widest text-sm block">PROF. LUCY</span>
                        <span className="text-[#00f3ff] text-[10px] font-mono tracking-widest uppercase">Lead Researcher</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-500 text-[10px] font-bold tracking-widest">ONLINE</span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f3ff]/50 to-transparent mb-4"></div>

                  <p className="text-gray-100 text-base leading-relaxed font-medium min-h-[80px]">
                    {displayedText}
                    <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-[#00f3ff] align-middle"></span>
                  </p>
              </div>
            </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* UI Overlay - Left Side */}
      <div className="z-30 w-full max-w-[1400px] mx-auto px-12 lg:px-24 flex flex-col justify-center h-full pointer-events-none relative">
        <div className="w-[40vw] max-w-[500px] pointer-events-auto flex flex-col gap-8">

          {/* Header Box */}
          <div className="relative p-8 rounded-xl bg-slate-900/40 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] overflow-hidden">
            {/* Internal hex pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='100' viewBox='0 0 60 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0zm0 17.32l-10.98 6.34v12.68L30 42.68l10.98-6.34V23.66L30 17.32z' fill='%2322d3ee' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                     backgroundSize: '30px'
                 }}
            />

            <div className="relative z-10">
              <h2 className="text-cyan-400 font-mono text-sm tracking-[0.3em] mb-2">PROJECT INIT</h2>
              <h1 className="text-[3.5rem] leading-[1] font-black tracking-tighter mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-600 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                CHEMIC<span className="text-[#00f3ff]">-</span>AI
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <div className="inline-block bg-cyan-900/50 border border-cyan-500/50 px-3 py-1 rounded text-cyan-200 text-xs tracking-widest uppercase">
                  Quantum Reality Engine v2.0
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-4">
            {/* START BUTTON */}
            <button
              onClick={handleStart}
              className="group relative px-6 py-4 bg-cyan-950/40 border border-cyan-400 hover:bg-cyan-900/60 rounded-xl text-left transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                    <span className="block font-mono text-cyan-400 text-[10px] tracking-widest mb-1 opacity-70">SEQUENCE: INITIATE</span>
                    <span className="block font-bold text-2xl text-white tracking-widest uppercase">
                      Start Engine
                    </span>
                </div>
                <div className="text-cyan-400 group-hover:translate-x-2 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            </button>

            {/* Pill-shaped active secondary buttons & Locked Story Mode */}
            <div className="flex flex-col gap-3 mt-2">

              {/* Locked "Story Mode" button */}
              <button className="px-6 py-3 bg-slate-900/40 border border-[#00f3ff]/20 rounded-full text-left backdrop-blur-sm flex items-center justify-between cursor-not-allowed opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-[#00f3ff]/50 font-mono text-xs">01</span>
                  <span className="text-gray-400 font-bold tracking-wider uppercase text-sm">Story Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#00f3ff]/60 font-mono tracking-widest uppercase">[COMING SOON]</span>
                  <svg className="w-4 h-4 text-[#00f3ff]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
              </button>

              <button className="px-6 py-3 bg-slate-800/60 hover:bg-slate-700/80 border border-cyan-500/20 hover:border-[#00f3ff]/50 rounded-full text-left transition-all duration-200 backdrop-blur-sm flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-[#00f3ff]/50 font-mono text-xs group-hover:text-[#00f3ff] transition-colors">02</span>
                  <span className="text-gray-300 font-bold tracking-wider uppercase text-sm group-hover:text-white transition-colors">Element Database</span>
                </div>
                <span className="text-[#00f3ff]/50 text-xs group-hover:text-[#00f3ff] transition-colors">→</span>
              </button>

              <button className="px-6 py-3 bg-slate-800/60 hover:bg-slate-700/80 border border-cyan-500/20 hover:border-[#00f3ff]/50 rounded-full text-left transition-all duration-200 backdrop-blur-sm flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-[#00f3ff]/50 font-mono text-xs group-hover:text-[#00f3ff] transition-colors">03</span>
                  <span className="text-gray-300 font-bold tracking-wider uppercase text-sm group-hover:text-white transition-colors">System Settings</span>
                </div>
                <span className="text-[#00f3ff]/50 text-xs group-hover:text-[#00f3ff] transition-colors">→</span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
