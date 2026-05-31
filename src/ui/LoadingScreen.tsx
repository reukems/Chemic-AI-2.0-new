import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../engine/store';

const loadingPhrases = [
  'Loading Molecular Database...',
  'Calibrating WebGL Engine...',
  'Initializing AI_Sprite_Core...',
  'Establishing Quantum Link...'
];

const generateHexCode = () => {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const BackgroundCode: React.FC = () => {
  const [columns, setColumns] = useState<string[][]>([]);
  const [durations, setDurations] = useState<number[]>([]);

  useEffect(() => {
    const colCount = Math.floor(window.innerWidth / 30);
    const initialColumns = Array(colCount).fill(null).map(() =>
      Array(20).fill(null).map(() => generateHexCode())
    );
    setColumns(initialColumns);
    setDurations(Array(colCount).fill(0).map(() => 10 + Math.random() * 10));

    const interval = setInterval(() => {
      setColumns(prev => prev.map(col => {
        const newCol = [...col];
        newCol.pop();
        newCol.unshift(generateHexCode());
        return newCol;
      }));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 flex justify-between pointer-events-none z-0">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col text-[#00FFFF] font-mono text-xs opacity-50" style={{ animation: `scrollDown ${durations[i]}s linear infinite` }}>
          {col.map((code, j) => (
            <div key={j} className="mb-1">{code}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

const LoadingScreen: React.FC = () => {
  const setAppState = useSimulationStore(state => state.setAppState);
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  // Typewriter effect
  useEffect(() => {
    const currentPhrase = loadingPhrases[phraseIndex];
    let i = 0;
    setTypedText('');

    const interval = setInterval(() => {
      if (i < currentPhrase.length) {
        setTypedText(prev => prev + currentPhrase.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, [phraseIndex]);

  useEffect(() => {
    // Simulate loading process
    const duration = 4000; // 4 seconds loading to show off effects
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const phraseSwitchInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
    }, 1200);

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        clearInterval(phraseSwitchInterval);
        setTimeout(() => {
          setAppState('WORKBENCH');
        }, 300); // small delay after reaching 100%
      }
    }, interval);

    return () => {
      clearInterval(timer);
      clearInterval(phraseSwitchInterval);
    };
  }, [setAppState]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050B14] text-[#00FFFF] font-mono overflow-hidden">

      <BackgroundCode />

      <div className="relative z-10 flex flex-col items-center">
        {/* Quantum Tech-Ring Spinner */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-t-[#00FFFF] border-r-transparent border-b-[#00FFFF]/30 border-l-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(0,255,255,0.4)]" style={{ animationDuration: '3s' }}></div>
          {/* Middle Ring (spins opposite) */}
          <div className="absolute inset-4 border-2 border-r-[#00FFFF]/80 border-b-transparent border-l-[#00FFFF]/20 border-t-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
          {/* Inner Ring */}
          <div className="absolute inset-8 border-4 border-dashed border-[#00FFFF]/50 rounded-full animate-[spin_4s_linear_infinite]"></div>
          {/* Core Glow */}
          <div className="absolute w-16 h-16 bg-[#00FFFF]/20 rounded-full blur-xl animate-pulse"></div>
          {/* Center text percentage */}
          <div className="absolute text-2xl font-bold tracking-widest text-[#00FFFF] drop-shadow-[0_0_8px_#00FFFF]">
            {Math.floor(progress)}%
          </div>
        </div>

        {/* Typewriter Text */}
        <div className="h-6 mb-4 flex items-center justify-center">
          <p className="text-sm tracking-widest text-[#00FFFF] font-medium shadow-cyan-500/50">
            {typedText}
            <span className="inline-block w-2 h-4 bg-[#00FFFF] ml-1 animate-pulse"></span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 h-1 bg-[#00FFFF]/10 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,255,255,0.2)]">
          <div
            className="h-full bg-[#00FFFF] shadow-[0_0_15px_#00FFFF]"
            style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
          ></div>
        </div>
      </div>

      {/* Decorative tech elements */}
      <div className="absolute bottom-10 left-10 text-xs opacity-50 space-y-1 font-mono tracking-widest z-10 text-[#00FFFF]">
        <p className="flex justify-between w-40"><span>Sys_Diag:</span> <span className="text-[#00FFFF] font-bold">OK</span></p>
        <p className="flex justify-between w-40"><span>Mem_Bank:</span> <span className="text-[#00FFFF] font-bold">ALLOCATED</span></p>
        <p className="flex justify-between w-40"><span>Core_Temp:</span> <span className="text-[#00FFFF] font-bold">STABLE</span></p>
      </div>

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
