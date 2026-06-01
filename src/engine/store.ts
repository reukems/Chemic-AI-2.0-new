import { create } from 'zustand';
import { CHEMICAL_REGISTRY, REACTION_RULES } from '../data/ChemicalRegistry';


export type AppState = 'MENU' | 'LOADING' | 'WORKBENCH';

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
    appState: AppState;
    setAppState: (state: AppState) => void;
    env: { temp: number; pressure: number };
    containers: Container[];
    activeEffect: 'bubbles' | 'smoke' | 'fire' | 'explosion' | 'fizz' | 'cloud' | null;
    activeEffectContainerId: number | null;

    // Reaction Popup
    pendingReaction: any | null;
    resolvePendingReaction: () => void;

    // Actions
    initialize: () => void;
    setEnvTemp: (temp: number) => void;
    setEnvPressure: (pressure: number) => void;
    spawnContainer: (type: 'beaker' | 'flask') => void;
    addReagentToContainer: (containerId: number, reagentId: string) => void;
    pourContainer: (sourceId: number, targetId: number, heightDiff: number) => void;
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
    appState: 'MENU',
    setAppState: (appState) => set({ appState }),
    env: { temp: 25, pressure: 1.0 },
    containers: [],
    activeEffect: null,
    activeEffectContainerId: null,
    pendingReaction: null,

    resolvePendingReaction: () => {
        const state = get();
        if (state.pendingReaction) {
            set({
                activeEffect: state.pendingReaction.effect,
                activeEffectContainerId: state.pendingReaction.containerId,
                pendingReaction: null
            });
            setTimeout(() => {
                 get().clearEffect();
            }, 3000);
        }
    },

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

        // 4.2 Dynamic Reaction Rules Engine
        let triggeredReaction: any = null;

        for (const rule of REACTION_RULES) {
            const hasBase = container.contents[rule.reactants[0]] > 0;
            const hasAdded = reagentId === rule.reactants[1]; // Dropped reagent

            // If order matters, we strictly check base vs added
            if (rule.orderMatters) {
                if (hasBase && hasAdded && !container.contents[`reacted_${rule.reactants[0]}_${rule.reactants[1]}`]) {
                    triggeredReaction = rule;
                    container.contents[`reacted_${rule.reactants[0]}_${rule.reactants[1]}`] = 1;
                    break;
                }
            } else {
                // Order doesn't matter, just check if both are present
                const hasA = container.contents[rule.reactants[0]] > 0;
                const hasB = container.contents[rule.reactants[1]] > 0;

                // Trigger if dropping either reactant into a container with the other
                if ((hasA && reagentId === rule.reactants[1]) || (hasB && reagentId === rule.reactants[0])) {
                    if (!container.contents[`reacted_${rule.reactants[0]}_${rule.reactants[1]}`]) {
                        triggeredReaction = rule;
                        container.contents[`reacted_${rule.reactants[0]}_${rule.reactants[1]}`] = 1;
                        break;
                    }
                }
            }
        }

        // Handle visual overrides like Phenolphthalein pink or Copper Precipitate
        if (triggeredReaction) {
            if (triggeredReaction.product === 'PINK_BASE') {
                container.color = {r: 244, g: 114, b: 182};
            }
            if (triggeredReaction.product === 'COPPER_HYDROXIDE') { // Assuming we add this rule later
                container.color = {r: 20, g: 60, b: 200};
            }
        }

        containers[containerIndex] = container;

        if (triggeredReaction && triggeredReaction.requiresPopup) {
            set({
                containers,
                pendingReaction: {
                    ...triggeredReaction,
                    containerId
                }
            });
        } else {
            set({
                containers,
                ...(triggeredReaction?.effect && {
                    activeEffect: triggeredReaction.effect,
                    activeEffectContainerId: containerId
                })
            });

            if (triggeredReaction?.effect) {
                 setTimeout(() => {
                     get().clearEffect();
                 }, 3000);
            }
        }
    },

    pourContainer: (sourceId: number, targetId: number, heightDiff: number) => {
        const state = get();
        const containers = [...state.containers];

        const sourceIdx = containers.findIndex(c => c.id === sourceId);
        const targetIdx = containers.findIndex(c => c.id === targetId);

        if (sourceIdx === -1 || targetIdx === -1) return;

        const source = { ...containers[sourceIdx], contents: { ...containers[sourceIdx].contents } };
        const target = { ...containers[targetIdx], contents: { ...containers[targetIdx].contents } };

        if (source.volume <= 0) return;
        if (target.volume >= target.maxVol) return;

        // Determine pour amount. Base rate is 1ml per tick, scales up.
        const safeHeight = Math.max(0, Math.min(heightDiff, 500));
        const pourRate = 1 + (safeHeight / 500) * 5;

        // Calculate actual amount to pour
        const availableSpace = target.maxVol - target.volume;
        const actualPour = Math.min(pourRate, source.volume, availableSpace);

        if (actualPour <= 0) return;

        // 1. Calculate color mixing for target
        if (target.volume === 0) {
            target.color = { ...source.color };
        } else {
            const tVol = target.volume + actualPour;
            target.color = {
                r: Math.round((target.color.r * target.volume + source.color.r * actualPour) / tVol),
                g: Math.round((target.color.g * target.volume + source.color.g * actualPour) / tVol),
                b: Math.round((target.color.b * target.volume + source.color.b * actualPour) / tVol)
            };
        }

        // 2. Transfer contents proportionally
        for (const [chemId, vol] of Object.entries(source.contents)) {
            const ratio = vol / source.volume;
            const transferredVol = ratio * actualPour;

            // Remove from source
            source.contents[chemId] -= transferredVol;
            if (source.contents[chemId] <= 0.01) delete source.contents[chemId];

            // Add to target
            target.contents[chemId] = (target.contents[chemId] || 0) + transferredVol;
        }

        source.volume -= actualPour;
        target.volume += actualPour;

        // 3. Recalculate pH for target
        let totalMolesH = 0;
        let totalVol = 0;
        for (const [id, vol] of Object.entries(target.contents)) {
            const rg = CHEMICAL_REGISTRY[id];
            if (!rg) continue;
            const hConc = Math.pow(10, -rg.ph);
            totalMolesH += hConc * vol;
            totalVol += vol;
        }
        const avgHConc = totalMolesH / totalVol;
        target.ph = -Math.log10(avgHConc);
        if(target.ph > 14) target.ph = 14;
        if(target.ph < 0) target.ph = 0;

        containers[sourceIdx] = source;
        containers[targetIdx] = target;

        // Dynamic Reaction Rules Engine for Pouring
        let triggeredReaction: any = null;

        // Check if any newly mixed chemicals trigger a reaction
        for (const rule of REACTION_RULES) {
            const r0 = rule.reactants[0];
            const r1 = rule.reactants[1];

            if (rule.orderMatters) {
                // Was r1 poured into r0?
                if (target.contents[r0] > 0 && source.contents[r1] > 0 && !target.contents[`reacted_${r0}_${r1}`]) {
                    triggeredReaction = rule;
                    target.contents[`reacted_${r0}_${r1}`] = 1;
                    break;
                }
            } else {
                if (target.contents[r0] > 0 && source.contents[r1] > 0 && !target.contents[`reacted_${r0}_${r1}`]) {
                    triggeredReaction = rule;
                    target.contents[`reacted_${r0}_${r1}`] = 1;
                    break;
                }
                if (target.contents[r1] > 0 && source.contents[r0] > 0 && !target.contents[`reacted_${r1}_${r0}`]) {
                    triggeredReaction = rule;
                    target.contents[`reacted_${r1}_${r0}`] = 1;
                    break;
                }
            }
        }

        // Handle visual overrides like Phenolphthalein pink
        if (triggeredReaction && triggeredReaction.product === 'PINK_BASE') {
            target.color = {r: 244, g: 114, b: 182};
        }

        containers[sourceIdx] = source;
        containers[targetIdx] = target;

        if (triggeredReaction && triggeredReaction.requiresPopup) {
            set({
                containers,
                pendingReaction: {
                    ...triggeredReaction,
                    containerId: targetId
                }
            });
        } else {
            // Splash effect if poured from high up and no other reaction overrides it
            let newEffect = triggeredReaction?.effect || ((safeHeight > 250) ? 'fizz' : null);

            set({
                containers,
                ...(newEffect && { activeEffect: newEffect, activeEffectContainerId: targetId })
            });

            if (newEffect) {
                 setTimeout(() => get().clearEffect(), triggeredReaction ? 3000 : 300);
            }
        }
    },

    flushAll: () => {
        set({ containers: [], activeEffect: null, activeEffectContainerId: null });
    },

    clearEffect: () => set({ activeEffect: null, activeEffectContainerId: null })
}));
