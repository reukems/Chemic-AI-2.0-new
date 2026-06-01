import React, { useState } from 'react';
import { PERIODIC_TABLE_DATA, ElementData } from '../data/PeriodicTableData';
import ElementInfoModal from './ElementInfoModal';

const CATEGORY_COLORS: Record<string, string> = {
    'diatomic nonmetal': 'rgba(34, 211, 238, 0.4)', // Cyan
    'noble gas': 'rgba(167, 139, 250, 0.4)', // Purple
    'alkali metal': 'rgba(248, 113, 113, 0.4)', // Red
    'alkaline earth metal': 'rgba(251, 146, 60, 0.4)', // Orange
    'metalloid': 'rgba(132, 204, 22, 0.4)', // Lime
    'polyatomic nonmetal': 'rgba(52, 211, 153, 0.4)', // Emerald
    'post-transition metal': 'rgba(96, 165, 250, 0.4)', // Blue
    'transition metal': 'rgba(250, 204, 21, 0.4)', // Yellow
    'lanthanide': 'rgba(244, 114, 182, 0.4)', // Pink
    'actinide': 'rgba(232, 121, 249, 0.4)', // Fuchsia
    'unknown, probably transition metal': 'rgba(156, 163, 175, 0.4)', // Gray
    'unknown, probably post-transition metal': 'rgba(156, 163, 175, 0.4)',
    'unknown, probably metalloid': 'rgba(156, 163, 175, 0.4)',
    'unknown, predicted to be noble gas': 'rgba(156, 163, 175, 0.4)',
};

const CATEGORY_BORDER_COLORS: Record<string, string> = {
    'diatomic nonmetal': '#22d3ee',
    'noble gas': '#a78bfa',
    'alkali metal': '#f87171',
    'alkaline earth metal': '#fb923c',
    'metalloid': '#84cc16',
    'polyatomic nonmetal': '#34d399',
    'post-transition metal': '#60a5fa',
    'transition metal': '#facc15',
    'lanthanide': '#f472b6',
    'actinide': '#e879f9',
    'unknown, probably transition metal': '#9ca3af',
    'unknown, probably post-transition metal': '#9ca3af',
    'unknown, probably metalloid': '#9ca3af',
    'unknown, predicted to be noble gas': '#9ca3af',
};

const PeriodicTableBoard: React.FC = () => {
    const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

    return (
        <div className="absolute top-[5%] left-[5%] w-[90%] h-[80%] z-0 flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity duration-500 pointer-events-none">
            <div className="pointer-events-auto relative bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-2xl flex flex-col items-center">
                <h1 className="text-xl font-bold text-cyan-500/80 mb-4 tracking-widest uppercase" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}>PERIODIC TABLE OF ELEMENTS</h1>

                <div
                    className="grid gap-1"
                    style={{
                        gridTemplateColumns: 'repeat(18, minmax(20px, 40px))',
                        gridTemplateRows: 'repeat(10, minmax(20px, 40px))', // 7 periods + 1 gap + 2 lanthanide/actinide
                    }}
                >
                    {PERIODIC_TABLE_DATA.map((element) => {
                        // Adjust rows for lanthanides and actinides to appear at the bottom
                        let row = element.period;
                        let col = element.group;

                        if (element.category === 'lanthanide') {
                            row = 9;
                            col = element.atomicNumber - 57 + 4; // Start at group 4 equivalent
                        } else if (element.category === 'actinide') {
                            row = 10;
                            col = element.atomicNumber - 89 + 4;
                        }

                        const bgColor = CATEGORY_COLORS[element.category] || 'rgba(156, 163, 175, 0.4)';
                        const borderColor = CATEGORY_BORDER_COLORS[element.category] || '#9ca3af';

                        return (
                            <div
                                key={element.atomicNumber}
                                onClick={() => setSelectedElement(element)}
                                className="relative cursor-pointer transition-all duration-200 hover:scale-125 hover:z-50 rounded flex flex-col items-center justify-center pt-element"
                                style={{
                                    gridRow: row,
                                    gridColumn: col,
                                    backgroundColor: bgColor,
                                    borderColor: borderColor,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    boxShadow: `inset 0 0 10px ${bgColor}, 0 0 5px ${bgColor}`,
                                }}
                            >
                                <span className="absolute top-0.5 left-1 text-[8px] text-white/70">{element.atomicNumber}</span>
                                <span className="text-sm font-bold text-white mt-2" style={{ textShadow: `0 0 5px ${borderColor}` }}>{element.symbol}</span>
                                <span className="text-[6px] text-white/50 truncate w-full text-center px-0.5">{element.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedElement && (
                <ElementInfoModal
                    element={selectedElement}
                    onClose={() => setSelectedElement(null)}
                    color={CATEGORY_BORDER_COLORS[selectedElement.category] || '#9ca3af'}
                />
            )}
        </div>
    );
};

export default PeriodicTableBoard;
