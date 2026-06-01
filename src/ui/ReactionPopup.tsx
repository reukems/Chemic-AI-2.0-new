import React from 'react';
import { useSimulationStore } from '../engine/store';
import { CHEMICAL_REGISTRY } from '../data/ChemicalRegistry';

const ReactionPopup: React.FC = () => {
    const pendingReaction = useSimulationStore(state => state.pendingReaction);
    const resolvePendingReaction = useSimulationStore(state => state.resolvePendingReaction);

    if (!pendingReaction) return null;

    const r0 = CHEMICAL_REGISTRY[pendingReaction.reactants[0]];
    const r1 = CHEMICAL_REGISTRY[pendingReaction.reactants[1]];
    const prod = CHEMICAL_REGISTRY[pendingReaction.product];

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-4">
            <div className="bg-[#171c28]/90 border-2 border-red-500/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] max-w-2xl w-full p-8 relative overflow-hidden">

                {/* Background warning stripes */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, transparent 10px, transparent 20px)'
                }}></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="text-red-500 mb-2">
                        <svg className="w-16 h-16 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-6 text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        CHEMICAL REACTION DETECTED
                    </h2>

                    <div className="w-full bg-[#0b0f19] rounded-xl p-6 border border-slate-700/50 mb-6 flex items-center justify-center gap-6">
                        {/* Reactant 1 */}
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-lg font-bold text-cyan-300 text-center">{r0?.name.EN || pendingReaction.reactants[0]}</span>
                            <span className="text-sm text-slate-500 font-mono mt-1">{r0?.formula || ''}</span>
                        </div>

                        <div className="text-3xl font-black text-slate-400">+</div>

                        {/* Reactant 2 */}
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-lg font-bold text-emerald-300 text-center">{r1?.name.EN || pendingReaction.reactants[1]}</span>
                            <span className="text-sm text-slate-500 font-mono mt-1">{r1?.formula || ''}</span>
                        </div>

                        <div className="text-3xl font-black text-slate-400">→</div>

                        {/* Product */}
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-lg font-bold text-rose-300 text-center">{prod?.name.EN || pendingReaction.product}</span>
                            <span className="text-sm text-slate-500 font-mono mt-1">{prod?.formula || ''}</span>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 w-full mb-8 text-center">
                        <p className="text-red-200 text-lg leading-relaxed font-medium">
                            {pendingReaction.message.EN}
                        </p>
                    </div>

                    <button
                        onClick={resolvePendingReaction}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-12 rounded-xl tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    >
                        ACKNOWLEDGE & PROCEED
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReactionPopup;
