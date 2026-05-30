import { create } from 'zustand';
import { CHEMICAL_REGISTRY, REACTION_RULES } from '../data/ChemicalRegistry';

export interface Container {
    id: number;
    volume: number; // 0.0 to 100.0
    maxVol: number;
    color: { r: number, g: number, b: number };
    contents: Record<string, number>; // map of chemical ID to volume in this beaker
    ph: number;
}

interface SimulationState {
    env: { temp: number; pressure: number };
    beakers: Container[];
    activeEffect: 'bubbles' | 'smoke' | 'fire' | 'explosion' | 'fizz' | 'cloud' | null;
    activeEffectContainerId: number | null;

    // Actions
    initialize: () => void;
    setEnvTemp: (temp: number) => void;
    setEnvPressure: (pressure: number) => void;
    addReagentToBeaker: (beakerId: number, reagentId: string) => void;
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

const STARTING_BEAKERS: Container[] = [
    { id: 0, volume: 0, maxVol: 100, color: {r:0, g:0, b:0}, contents: {}, ph: 7 },
    { id: 1, volume: 0, maxVol: 100, color: {r:0, g:0, b:0}, contents: {}, ph: 7 },
    { id: 2, volume: 0, maxVol: 100, color: {r:0, g:0, b:0}, contents: {}, ph: 7 }
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
    env: { temp: 25, pressure: 1.0 },
    beakers: STARTING_BEAKERS,
    activeEffect: null,
    activeEffectContainerId: null,

    initialize: () => {
        set({ beakers: JSON.parse(JSON.stringify(STARTING_BEAKERS)), env: { temp: 25, pressure: 1.0 } });
    },

    setEnvTemp: (temp: number) => set((state) => ({ env: { ...state.env, temp } })),
    setEnvPressure: (pressure: number) => set((state) => ({ env: { ...state.env, pressure } })),

    addReagentToBeaker: (beakerId: number, reagentId: string) => {
        const state = get();
        const reagent = CHEMICAL_REGISTRY[reagentId];
        if (!reagent) return;

        const beakers = [...state.beakers];
        const beaker = { ...beakers.find(b => b.id === beakerId) } as Container;
        if (!beaker) return;

        const addVol = 20; // 20ml per drop

        if (beaker.volume >= beaker.maxVol) {
            console.log("Beaker is FULL!");
            return;
        }

        const rColor = hexToRgb(reagent.color);

        // 4.1 Optical Color Mixing Algorithm
        if (beaker.volume === 0) {
            beaker.color = { ...rColor };
        } else {
            const tVol = beaker.volume + addVol;
            beaker.color = {
                r: Math.round((beaker.color.r * beaker.volume + rColor.r * addVol) / tVol),
                g: Math.round((beaker.color.g * beaker.volume + rColor.g * addVol) / tVol),
                b: Math.round((beaker.color.b * beaker.volume + rColor.b * addVol) / tVol)
            };
        }

        beaker.volume += addVol;
        beaker.contents = { ...beaker.contents, [reagentId]: (beaker.contents[reagentId] || 0) + addVol };

        // Simple pH approximation
        let totalMolesH = 0;
        let totalVol = 0;
        for (const [id, vol] of Object.entries(beaker.contents)) {
            const rg = CHEMICAL_REGISTRY[id];
            if (!rg) continue;
            const hConc = Math.pow(10, -rg.ph);
            totalMolesH += hConc * vol;
            totalVol += vol;
        }
        const avgHConc = totalMolesH / totalVol;
        beaker.ph = -Math.log10(avgHConc);
        if(beaker.ph > 14) beaker.ph = 14;
        if(beaker.ph < 0) beaker.ph = 0;

        // 4.2 Check for Reactions
        let newEffect: any = null;
        const has = (id: string) => beaker.contents[id] > 0;

        // Reaction 1: Acid + Base
        if (has('HCl') && has('NaOH') && !beaker.contents['reacted_neutral']) {
            newEffect = 'bubbles';
            beaker.contents['reacted_neutral'] = 1;
        }

        // Reaction 2: CuSO4 + NaOH (Copper Hydroxide Precipitate)
        if (has('COPPER_SULFATE') && has('NaOH') && !beaker.contents['reacted_cuoh']) {
            beaker.color = {r: 20, g: 60, b: 200}; // Force color to deep blue
            newEffect = 'cloud';
            beaker.contents['reacted_cuoh'] = 1;
        }

        // Phenolphthalein + NaOH
        if (has('PHENOLPHTHALEIN') && has('NaOH') && !beaker.contents['reacted_pink']) {
            beaker.color = {r: 244, g: 114, b: 182}; // Force color to pink
            newEffect = 'fizz';
            beaker.contents['reacted_pink'] = 1;
        }

        beakers[beakerId] = beaker;

        set({
            beakers,
            ...(newEffect && {
                activeEffect: newEffect,
                activeEffectContainerId: beakerId
            })
        });

        if (newEffect) {
             setTimeout(() => {
                 get().clearEffect();
             }, 3000);
        }
    },

    flushAll: () => {
        set({ beakers: JSON.parse(JSON.stringify(STARTING_BEAKERS)), activeEffect: null, activeEffectContainerId: null });
    },

    clearEffect: () => set({ activeEffect: null, activeEffectContainerId: null })
}));
