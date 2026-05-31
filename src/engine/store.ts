import { create } from 'zustand';
import { CHEMICAL_REGISTRY, REACTION_RULES } from '../data/ChemicalRegistry';

export interface Container {
    id: number;
    type: 'beaker' | 'flask';
    volume: number; // 0.0 to 100.0
    maxVol: number;
    color: { r: number, g: number, b: number };
    contents: Record<string, number>; // map of chemical ID to volume in this container
    ph: number;
}

interface SimulationState {
    env: { temp: number; pressure: number };
    containers: Container[];
    activeEffect: 'bubbles' | 'smoke' | 'fire' | 'explosion' | 'fizz' | 'cloud' | null;
    activeEffectContainerId: number | null;

    // Actions
    initialize: () => void;
    setEnvTemp: (temp: number) => void;
    setEnvPressure: (pressure: number) => void;
    spawnContainer: (type: 'beaker' | 'flask') => void;
    addReagentToContainer: (containerId: number, reagentId: string) => void;
    flushAll: () => void;
    clearEffect: () => void;
}

// Convert Hex string to RGB
const hexToRgb = (hex: string) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
    env: { temp: 25, pressure: 1.0 },
    containers: [],
    activeEffect: null,
    activeEffectContainerId: null,

    initialize: () => {
        set({ containers: [], env: { temp: 25, pressure: 1.0 } });
    },

    setEnvTemp: (temp: number) => set((state) => ({ env: { ...state.env, temp } })),
    setEnvPressure: (pressure: number) => set((state) => ({ env: { ...state.env, pressure } })),

    spawnContainer: (type: 'beaker' | 'flask') => {
        const state = get();
        if (state.containers.length >= 4) {
            console.log("Max containers reached!");
            return;
        }
        const newId = state.containers.length > 0 ? Math.max(...state.containers.map(c => c.id)) + 1 : 0;
        const newContainer: Container = {
            id: newId,
            type,
            volume: 0,
            maxVol: 100,
            color: { r: 0, g: 0, b: 0 },
            contents: {},
            ph: 7
        };
        set({ containers: [...state.containers, newContainer] });
    },

    addReagentToContainer: (containerId: number, reagentId: string) => {
        const state = get();
        const reagent = CHEMICAL_REGISTRY[reagentId];
        if (!reagent) return;

        const containers = [...state.containers];
        const containerIndex = containers.findIndex(c => c.id === containerId);
        if (containerIndex === -1) return;

        const container = { ...containers[containerIndex] } as Container;

        const addVol = 20; // 20ml per drop

        if (container.volume >= container.maxVol) {
            console.log("Container is FULL!");
            return;
        }

        const rColor = hexToRgb(reagent.color);

        // 4.1 Optical Color Mixing Algorithm
        if (container.volume === 0) {
            container.color = { ...rColor };
        } else {
            const tVol = container.volume + addVol;
            container.color = {
                r: Math.round((container.color.r * container.volume + rColor.r * addVol) / tVol),
                g: Math.round((container.color.g * container.volume + rColor.g * addVol) / tVol),
                b: Math.round((container.color.b * container.volume + rColor.b * addVol) / tVol)
            };
        }

        container.volume += addVol;
        container.contents = { ...container.contents, [reagentId]: (container.contents[reagentId] || 0) + addVol };

        // Simple pH approximation
        let totalMolesH = 0;
        let totalVol = 0;
        for (const [id, vol] of Object.entries(container.contents)) {
            const rg = CHEMICAL_REGISTRY[id];
            if (!rg) continue;
            const hConc = Math.pow(10, -rg.ph);
            totalMolesH += hConc * vol;
            totalVol += vol;
        }
        const avgHConc = totalMolesH / totalVol;
        container.ph = -Math.log10(avgHConc);
        if(container.ph > 14) container.ph = 14;
        if(container.ph < 0) container.ph = 0;

        // 4.2 Check for Reactions
        let newEffect: any = null;
        const has = (id: string) => container.contents[id] > 0;

        // Reaction 1: Acid + Base
        if (has('HCl') && has('NaOH') && !container.contents['reacted_neutral']) {
            newEffect = 'bubbles';
            container.contents['reacted_neutral'] = 1;
        }

        // Reaction 2: CuSO4 + NaOH (Copper Hydroxide Precipitate)
        if (has('COPPER_SULFATE') && has('NaOH') && !container.contents['reacted_cuoh']) {
            container.color = {r: 20, g: 60, b: 200}; // Force color to deep blue
            newEffect = 'cloud';
            container.contents['reacted_cuoh'] = 1;
        }

        // Phenolphthalein + NaOH
        if (has('PHENOLPHTHALEIN') && has('NaOH') && !container.contents['reacted_pink']) {
            container.color = {r: 244, g: 114, b: 182}; // Force color to pink
            newEffect = 'fizz';
            container.contents['reacted_pink'] = 1;
        }

        containers[containerIndex] = container;

        set({
            containers,
            ...(newEffect && {
                activeEffect: newEffect,
                activeEffectContainerId: containerId
            })
        });

        if (newEffect) {
             setTimeout(() => {
                 get().clearEffect();
             }, 3000);
        }
    },

    flushAll: () => {
        set({ containers: [], activeEffect: null, activeEffectContainerId: null });
    },

    clearEffect: () => set({ activeEffect: null, activeEffectContainerId: null })
}));
