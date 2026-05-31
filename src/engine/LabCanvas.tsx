import React from 'react';
import LabContainer from './LabContainer';
import { useSimulationStore } from './store';

const LabCanvas: React.FC = () => {
    const containers = useSimulationStore(state => state.containers);
    const spawnContainer = useSimulationStore(state => state.spawnContainer);

    const handleDragOver = (e: React.DragEvent) => {
        // Allow dropping containers onto the canvas
        if (e.dataTransfer.types.includes('containertype')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        const containerType = e.dataTransfer.getData('containerType');
        if (containerType === 'beaker' || containerType === 'flask') {
            e.preventDefault();
            spawnContainer(containerType);
        }
    };

    return (
        <div
            className="flex-1 flex items-end justify-center gap-24 relative w-full h-full pb-[20%]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="relative z-10 flex gap-24 items-end">
                {containers.map(c => (
                    <LabContainer key={c.id} id={c.id} />
                ))}
            </div>

            {/* Solid Lab Desk Extending Downwards */}
            <div className="absolute bottom-0 w-3/4 h-[20%] desk-surface border-t-2 border-slate-700 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-2xl flex justify-center">
                <div className="w-[95%] h-[2px] bg-cyan-500/30 mt-1"></div>
            </div>
        </div>
    );
};

export default LabCanvas;
