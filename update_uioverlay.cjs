const fs = require('fs');
let content = fs.readFileSync('src/ui/UIOverlay.tsx', 'utf-8');

const originalInventory = `{Object.values(CHEMICAL_REGISTRY).map(chem => (
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
                            ))}`;

const newInventory = `{Object.values(CHEMICAL_REGISTRY).map(chem => (
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
                            ))}`;

content = content.replace(originalInventory, newInventory);
fs.writeFileSync('src/ui/UIOverlay.tsx', content);
