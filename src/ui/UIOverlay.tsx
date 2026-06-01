import React, { useState } from 'react';
import { useSimulationStore } from '../engine/store';
import { CHEMICAL_REGISTRY } from '../data/ChemicalRegistry';
import { askAkiAssistant } from '../engine/aiService';

const UIOverlay: React.FC = () => {
    const { env, setEnvTemp, setEnvPressure, flushAll } = useSimulationStore();
    const containers = useSimulationStore(state => state.containers);

    // Local state for chat
    const [userInput, setUserInput] = useState("");
    const [aiResponse, setAiResponse] = useState("Hello! I'm Professor Lucy! Are you ready to do some science? Just drag and drop chemicals from the inventory to the containers!");
    const [isThinking, setIsThinking] = useState(false);
    const [inventoryOpen, setInventoryOpen] = useState(true);
    const [equipmentOpen, setEquipmentOpen] = useState(true);

    const handleAnalyze = async (query: string | React.MouseEvent) => {
        setIsThinking(true);
        // Create a clean state object for the AI
        const cleanState = containers.map(c => ({
            id: c.id,
            volume: c.volume,
            pH: c.ph.toFixed(1),
            contents: Object.entries(c.contents).reduce((acc, [chemId, vol]) => {
                if(!chemId.startsWith('reacted_')) {
                    acc[CHEMICAL_REGISTRY[chemId]?.name.EN || chemId] = vol;
                }
                return acc;
            }, {} as Record<string, number>),
            temperature: env.temp
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

    // Drag start for Reagents
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.setData(`reagent-${id}`, 'true'); // Hack to make type readable in dragover
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans overflow-hidden select-none z-50">

            {/* Top Left Section: Title Box and Status */}
            <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-auto w-64 transform origin-top-left scale-90">
                {/* Title Box */}
                <div className="bg-[#1f2335] rounded-xl p-4 shadow-2xl border border-slate-700/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <h1
                        className="text-3xl font-black tracking-wider mb-1 font-mono relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        style={{ backgroundSize: '200% 200%', animation: 'rgb-shift 5s ease infinite' }}
                    >
                        CHEMIC-AI
                    </h1>
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 text-emerald-500" style={{ animation: 'pulse-sync 2s infinite' }}></div>
                        <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">QUANTUM REALITY ENGINE</span>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="bg-[#1f2335] rounded-lg px-3 py-2 flex justify-between items-center shadow-lg border border-slate-700/50">
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">STATUS</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">SAFE</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 text-emerald-500" style={{ animation: 'pulse-sync 2s infinite' }}></div>
                    </div>
                </div>

                 {/* Environment Controls */}
                 <div className="bg-[#1f2335] rounded-xl p-3 shadow-2xl border border-slate-700/50 flex flex-col gap-2">
                    <h2 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Environment</h2>

                    <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">Temp</span>
                        <input type="range" className="w-20 mx-2" min="0" max="100" value={env.temp} onChange={(e) => setEnvTemp(Number(e.target.value))} />
                        <span className="text-cyan-300 w-10 text-right">{env.temp}°C</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">Pres</span>
                        <input type="range" className="w-20 mx-2" min="0.1" max="5.0" value={env.pressure} step="0.1" onChange={(e) => setEnvPressure(Number(e.target.value))} />
                        <span className="text-cyan-300 w-10 text-right">{env.pressure.toFixed(1)} atm</span>
                    </div>

                    <button onClick={flushAll} className="mt-1 w-full py-1 border border-rose-500/50 hover:bg-rose-500/20 text-rose-400 rounded text-[9px] font-bold tracking-wider transition-colors uppercase">
                        ⚠️ EMERGENCY FLUSH
                    </button>
                </div>

                {/* Equipment Sidebar (Draggable Containers) */}
                <div className="bg-[#1f2335] rounded-xl flex flex-col shadow-2xl border border-slate-700/50 overflow-hidden mt-1">
                    <div className="px-3 py-2 border-b border-slate-700/50 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setEquipmentOpen(!equipmentOpen)}>
                        <h2 className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">EQUIPMENT</h2>
                        <span className="text-slate-400 text-[10px]">{equipmentOpen ? '▼' : '▶'}</span>
                    </div>

                    {equipmentOpen && (
                        <div className="p-2 flex flex-col gap-1.5">
                            <div
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('containerType', 'beaker');
                                }}
                                className="reagent-btn flex justify-between items-center p-2 rounded-lg text-left"
                            >
                                <span className="text-xs font-bold text-slate-200">Empty Beaker</span>
                                <span className="text-lg">🫙</span>
                            </div>
                            <div
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('containerType', 'flask');
                                }}
                                className="reagent-btn flex justify-between items-center p-2 rounded-lg text-left"
                            >
                                <span className="text-xs font-bold text-slate-200">Empty Flask</span>
                                <span className="text-lg">⚗️</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Inventory Sidebar (Now Draggable Reagents) */}
                <div className="bg-[#1f2335] rounded-xl flex flex-col shadow-2xl border border-slate-700/50 overflow-hidden mt-1">
                    <div className="px-3 py-2 border-b border-slate-700/50 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setInventoryOpen(!inventoryOpen)}>
                        <h2 className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">REAGENTS</h2>
                        <span className="text-slate-400 text-[10px]">{inventoryOpen ? '▼' : '▶'}</span>
                    </div>

                    {inventoryOpen && (
                        <div className="p-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar h-[20vh]">
                            {Object.values(CHEMICAL_REGISTRY).map(chem => (
                                chem.type !== 'solid' && (
                                    <div
                                        key={chem.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, chem.id)}
                                        className="reagent-btn flex justify-between items-center p-2 rounded-lg text-left"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-200">{chem.name.EN}</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{chem.formula}</span>
                                        </div>
                                        <div
                                            className="reagent-dot !w-4 !h-4"
                                            style={{ color: chem.color, backgroundColor: chem.color }}
                                        />
                                    </div>
                                )
                            ))}
                            {Object.values(CHEMICAL_REGISTRY).map(chem => (
                                chem.type === 'solid' && (
                                    <div
                                        key={chem.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, chem.id)}
                                        className="reagent-btn flex justify-between items-center p-2 rounded-lg text-left border-dashed border-orange-500/30 hover:border-orange-500/60"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-orange-200">{chem.name.EN} (Solid)</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{chem.formula}</span>
                                        </div>
                                        <span className="text-lg">🪨</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Top Right Section: Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3 pointer-events-auto">
                <button
                    onClick={flushAll}
                    className="w-10 h-10 bg-[#303755] hover:bg-rose-500/20 border hover:border-rose-500/50 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-400 shadow-lg transition-colors"
                    title="Reset Lab"
                >
                    🔄
                </button>
            </div>

            {/* Bottom Section: Lucy Chat Bar (Right Aligned) */}
            <div className="absolute bottom-6 right-6 pointer-events-auto">
                <div className="w-[380px] glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3 bg-[#1a1d2d]">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-slate-600 bg-slate-800">
                            <img src="/lucy_avatar.png" alt="Prof. Lucy" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold text-white">Commlink - PROF. LUCY</h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 text-emerald-500" style={{ animation: 'pulse-sync 2s infinite' }}></div>
                                <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="p-5 text-sm text-slate-300 leading-relaxed min-h-[120px] bg-[#1f2335]/50">
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
                    <div className="p-4 bg-[#1f2335]/50 border-t border-slate-700/50">
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
                    <div className="w-2 h-2 rounded-full bg-emerald-500 text-emerald-500" style={{ animation: 'pulse-sync 2s infinite' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">[SYSTEM: ONLINE]</span>
                </div>
                <div className="w-px h-3 bg-slate-600/50"></div>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">[NODE: GEMINI_2.5]</span>
            </div>

        </div>
    );
};

export default UIOverlay;
