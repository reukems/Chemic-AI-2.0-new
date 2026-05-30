import React, { useState } from 'react';
import { useSimulationStore } from '../engine/store';
import { CHEMICAL_REGISTRY } from '../data/ChemicalRegistry';
import { askAkiAssistant } from '../engine/aiService';
import lucyAvatar from '../assets/lucy_avatar.png'; // Assuming an avatar image exists or will be added

const UIOverlay: React.FC = () => {
    const { containers, resetLab, addContainer } = useSimulationStore();
    const [aiResponse, setAiResponse] = useState<string>("Hello! I'm Professor Lucy 🦊! Are you ready to do some science? Just drag and drop chemicals to mix them! If you need a Gemini key, go to Settings! 😁");
    const [isThinking, setIsThinking] = useState(false);
    const [userInput, setUserInput] = useState("");

    const handleAnalyze = async (query?: string) => {
        setIsThinking(true);

        const cleanState = containers.map(c => ({
            chemical: c.chemicalId ? CHEMICAL_REGISTRY[c.chemicalId].name.EN : 'Empty',
            volume: c.volume,
            temperature: c.temperature
        }));

        const response = await askAkiAssistant(typeof query === 'string' ? query : "Give me a general status report on the current workbench.", cleanState);
        setAiResponse(response);
        setIsThinking(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && userInput.trim()) {
            handleAnalyze(userInput);
            setUserInput("");
        }
    };

    const [inventoryOpen, setInventoryOpen] = useState(true);

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans overflow-hidden select-none">

            {/* Top Left Section: Title Box and Status */}
            <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-auto w-80">
                {/* Title Box */}
                <div className="bg-[#1f2335] rounded-xl p-5 shadow-2xl border border-slate-700/50">
                    <h1 className="text-3xl font-black tracking-wider text-white mb-2">CHEMIC-AI</h1>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">QUANTUM REALITY ENGINE</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-[#2a1f1a] hover:bg-[#3a2f2a] border border-[#ff8a00]/30 text-[#ff8a00] rounded-lg py-2 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors">
                            <span className="text-sm">⚡</span> FAST
                        </button>
                        <button className="w-10 bg-[#252b42] hover:bg-[#303755] border border-slate-700/50 text-slate-300 rounded-lg flex items-center justify-center transition-colors">
                            ⚙️
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="bg-[#1f2335] rounded-lg px-4 py-3 flex justify-between items-center shadow-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">STATUS</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">SAFE</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                </div>

                {/* Inventory Sidebar */}
                <div className="bg-[#1f2335] rounded-xl flex flex-col shadow-2xl border border-slate-700/50 overflow-hidden mt-2">
                    <div className="px-4 py-3 border-b border-slate-700/50 flex justify-between items-center cursor-pointer" onClick={() => setInventoryOpen(!inventoryOpen)}>
                        <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">INVENTORY</h2>
                        <span className="text-slate-400 text-xs">{inventoryOpen ? '▼' : '▶'}</span>
                    </div>

                    {inventoryOpen && (
                        <div className="p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar h-[45vh]">
                            {Object.values(CHEMICAL_REGISTRY).map(chem => (
                                <button
                                    key={chem.id}
                                    onClick={() => addContainer(chem.id)}
                                    className="flex justify-between items-center p-3 rounded-lg bg-[#181b2a] border border-slate-700/30 hover:border-slate-500/50 transition-all text-left"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-200">{chem.name.EN}</span>
                                        <span className="text-[10px] text-slate-500">{chem.formula}</span>
                                    </div>
                                    <div
                                        className="w-2 h-2 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.2)]"
                                        style={{ backgroundColor: chem.color }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Top Right Section: Exam and Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3 pointer-events-auto">
                <button
                    onClick={resetLab}
                    className="w-10 h-10 bg-[#303755] hover:bg-[#3d466b] rounded-full flex items-center justify-center text-slate-300 shadow-lg transition-colors"
                >
                    🔄
                </button>
            </div>

            {/* Bottom Section: Lucy Chat Bar (Right Aligned) */}
            <div className="absolute bottom-6 right-6 pointer-events-auto">
                <div className="w-[380px] bg-[#1f2335] border border-slate-700/50 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3 bg-[#1a1d2d]">
                        <div className="w-10 h-10 rounded-lg bg-orange-200 overflow-hidden flex items-center justify-center border border-slate-600">
                             {/* Fallback emoji if image not found */}
                            <span className="text-2xl">🦊</span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold text-white">Commlink - PROF. LUCY</h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="p-5 text-sm text-slate-300 leading-relaxed min-h-[120px] bg-[#1f2335]">
                        {isThinking ? (
                            <span className="flex items-center gap-2 text-cyan-400">
                                Typing
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                </span>
                            </span>
                        ) : (
                            <span className="whitespace-pre-wrap">{aiResponse}</span>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-[#1f2335]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter query..."
                                className="w-full bg-[#151824] border border-slate-700/50 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isThinking}
                            />
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#252b42] hover:bg-[#303755] rounded-lg flex items-center justify-center text-cyan-400 transition-colors"
                                onClick={() => {
                                    if(userInput.trim()) {
                                        handleAnalyze(userInput);
                                        setUserInput("");
                                    }
                                }}
                            >
                                <span className="text-xs">^</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Center Status Bar (System & Node) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1f2335]/80 backdrop-blur border border-slate-700/50 rounded-full px-6 py-2 shadow-lg pointer-events-auto">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">[SYSTEM: ONLINE]</span>
                </div>
                <div className="w-px h-3 bg-slate-600/50"></div>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">[NODE: GEMINI_2.5]</span>
            </div>

        </div>
    );
};

export default UIOverlay;
