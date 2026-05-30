import React from 'react';
import Beaker from './Beaker';
import { useSimulationStore } from './store';

const LabCanvas: React.FC = () => {
    const beakers = useSimulationStore(state => state.beakers);

    return (
        <div className="flex-1 flex items-center justify-center gap-24 relative w-full h-full pt-32">
            {beakers.map(b => (
                <Beaker key={b.id} id={b.id} />
            ))}
            {/* Lab Table Surface Line */}
            <div className="absolute bottom-[20%] w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
        </div>
    );
};

export default LabCanvas;
