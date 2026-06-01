import React from 'react';
import { ElementData } from '../data/PeriodicTableData';

interface Props {
    element: ElementData;
    onClose: () => void;
    color: string;
}

const ElementInfoModal: React.FC<Props> = ({ element, onClose, color }) => {
    // Generate some fake electrons for the 3D atom visualization based on atomic number
    const maxElectrons = Math.min(element.atomicNumber, 30); // Cap for visual sanity
    const shells = [];
    let remaining = maxElectrons;
    let n = 1;
    while (remaining > 0) {
        const capacity = 2 * n * n;
        const inShell = Math.min(remaining, capacity);
        shells.push(inShell);
        remaining -= inShell;
        n++;
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
            <div
                className="relative w-[600px] h-[400px] bg-[#0f172a] rounded-2xl border flex overflow-hidden shadow-2xl"
                style={{ borderColor: color, boxShadow: `0 0 40px ${color}40` }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
                >
                    ✕
                </button>

                {/* Left Side: 3D Atom Visualization */}
                <div className="w-1/2 h-full border-r border-white/10 flex items-center justify-center relative bg-black/40 overflow-hidden atom-container">
                    {/* Nucleus */}
                    <div
                        className="absolute w-8 h-8 rounded-full z-10"
                        style={{
                            background: `radial-gradient(circle, #fff 0%, ${color} 50%, #000 100%)`,
                            boxShadow: `0 0 20px ${color}`
                        }}
                    ></div>

                    {/* Electron Orbits */}
                    {shells.map((electrons, index) => {
                        const radius = 40 + (index * 30);
                        return (
                            <div
                                key={index}
                                className="absolute rounded-full border border-white/20 atom-orbit"
                                style={{
                                    width: radius * 2,
                                    height: radius * 2,
                                    animationDuration: `${10 + index * 5}s`,
                                    animationDirection: index % 2 === 0 ? 'normal' : 'reverse'
                                }}
                            >
                                {/* Electrons on this orbit */}
                                {Array.from({ length: electrons }).map((_, eIndex) => {
                                    const angle = (eIndex / electrons) * 360;
                                    return (
                                        <div
                                            key={eIndex}
                                            className="absolute w-2 h-2 bg-white rounded-full"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                                transform: `rotate(${angle}deg) translateX(${radius}px) translateY(-50%)`,
                                                boxShadow: `0 0 5px #fff`
                                            }}
                                        ></div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Right Side: Data */}
                <div className="w-1/2 h-full p-8 flex flex-col relative">
                    <div
                        className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at top right, ${color}, transparent)`
                        }}
                    ></div>

                    <div className="flex items-end gap-4 mb-6 border-b border-white/10 pb-4">
                        <div
                            className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                            style={{ backgroundColor: `${color}40`, border: `2px solid ${color}` }}
                        >
                            {element.symbol}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-wide">{element.name}</h2>
                            <p className="text-sm uppercase tracking-widest" style={{ color }}>{element.category}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 flex-1 text-sm">
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Atomic Number</p>
                            <p className="text-white font-mono text-lg">{element.atomicNumber}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Atomic Mass</p>
                            <p className="text-white font-mono text-lg">{element.atomicMass} u</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Group / Period</p>
                            <p className="text-white font-mono text-lg">{element.group || '-'} / {element.period}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Electron Config</p>
                            <p className="text-white font-mono text-[11px] break-all">{element.electronConfiguration || '-'}</p>
                        </div>
                    </div>

                    <div className="mt-auto h-32 overflow-y-auto custom-scrollbar pr-2">
                         <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-2 sticky top-0 bg-[#0f172a] py-1">Description</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{element.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElementInfoModal;
