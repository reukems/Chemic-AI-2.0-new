import { create } from 'zustand';
import { CHEMICAL_REGISTRY, REACTION_RULES } from '../data/ChemicalRegistry';

export interface Container {
    id: string;
    x: number; // Percentage 0-100 across the workbench
    y: number; // Base level height
    chemicalId: string | null; // null if empty
    volume: number; // 0.0 to 1.0 (100%)
    temperature: number; // Celsius
    color: string; // Current color (blended or exact)
}

interface SimulationState {
    containers: Container[];
    activeEffect: 'bubbles' | 'smoke' | 'fire' | 'explosion' | null;
    activeEffectContainerId: string | null;

    // Actions
    initialize: () => void;
    addContainer: (chemicalId: string, x?: number) => void;
    moveContainer: (id: string, x: number) => void;
    pour: (sourceId: string, targetId: string) => void;
    clearEffect: () => void;
    resetLab: () => void;

    // Drag and Drop
    draggedContainerId: string | null;
    setDraggedContainer: (id: string | null) => void;
    mergeContainers: (sourceId: string, targetId: string) => void;
}

const STARTING_CONTAINERS: Container[] = [
    { id: 'beaker-1', x: 30, y: 0, chemicalId: 'H2O', volume: 0.5, temperature: 25, color: CHEMICAL_REGISTRY['H2O'].color },
    { id: 'beaker-2', x: 70, y: 0, chemicalId: 'HCl', volume: 0.3, temperature: 25, color: CHEMICAL_REGISTRY['HCl'].color }
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
    containers: [],
    activeEffect: null,
    activeEffectContainerId: null,
    draggedContainerId: null,

    initialize: () => {
        set({ containers: STARTING_CONTAINERS });
    },

    addContainer: (chemicalId: string, x: number = 50) => {
        const chem = CHEMICAL_REGISTRY[chemicalId];
        if (!chem) return;

        const newContainer: Container = {
            id: `container-${Date.now()}`,
            x,
            y: 0,
            chemicalId: chemicalId,
            volume: 0.2, // Default spawn volume
            temperature: 25,
            color: chem.color
        };

        set((state) => ({ containers: [...state.containers, newContainer] }));
    },

    moveContainer: (id: string, x: number) => {
        set((state) => ({
            containers: state.containers.map(c => c.id === id ? { ...c, x } : c)
        }));
    },

    pour: (sourceId: string, targetId: string) => {
        const state = get();
        const source = state.containers.find(c => c.id === sourceId);
        const target = state.containers.find(c => c.id === targetId);

        if (!source || !target || !source.chemicalId) return;
        if (source.volume <= 0) return;

        // Pour logic (simplified)
        const pourAmount = Math.min(source.volume, 0.1); // Pour 10% capacity at a time
        const newSourceVolume = source.volume - pourAmount;

        // If target is empty, just transfer
        if (!target.chemicalId) {
            set((state) => ({
                containers: state.containers.map(c => {
                    if (c.id === sourceId) return { ...c, volume: newSourceVolume, chemicalId: newSourceVolume <= 0 ? null : c.chemicalId };
                    if (c.id === targetId) return { ...c, chemicalId: source.chemicalId, volume: target.volume + pourAmount, color: source.color };
                    return c;
                })
            }));
            return;
        }

        // Reaction check
        let resultingChemId = target.chemicalId;
        let resultingColor = target.color;
        let newEffect = state.activeEffect;
        let newEffectContainer = state.activeEffectContainerId;

        // Simple lookup (order independent)
        const reaction = REACTION_RULES.find(r =>
            (r.reactants[0] === source.chemicalId && r.reactants[1] === target.chemicalId) ||
            (r.reactants[1] === source.chemicalId && r.reactants[0] === target.chemicalId)
        );

        if (reaction) {
            resultingChemId = reaction.product;
            resultingColor = reaction.productColor || CHEMICAL_REGISTRY[reaction.product].color;
            if (reaction.effect) {
                newEffect = reaction.effect;
                newEffectContainer = targetId;

                // Auto clear effect after 3s
                setTimeout(() => {
                    get().clearEffect();
                }, 3000);
            }
        } else {
            // No reaction, simple physical blend (averaging hex colors is tricky, simplify for now by keeping target color or picking dominant)
            // In a real AAA 2D setup, you'd convert to RGB, average, and back to hex.
        }

        set((state) => ({
            activeEffect: newEffect,
            activeEffectContainerId: newEffectContainer,
            containers: state.containers.map(c => {
                if (c.id === sourceId) return {
                    ...c,
                    volume: newSourceVolume,
                    chemicalId: newSourceVolume <= 0 ? null : c.chemicalId
                };
                if (c.id === targetId) return {
                    ...c,
                    chemicalId: resultingChemId,
                    volume: Math.min(1.0, c.volume + pourAmount),
                    color: resultingColor
                };
                return c;
            })
        }));
    },

    clearEffect: () => set({ activeEffect: null, activeEffectContainerId: null }),

    resetLab: () => set({ containers: STARTING_CONTAINERS, activeEffect: null, activeEffectContainerId: null }),

    setDraggedContainer: (id: string | null) => set({ draggedContainerId: id }),

    mergeContainers: (sourceId: string, targetId: string) => {
        // Just call pour for now to handle the reaction logic
        get().pour(sourceId, targetId);
    }
}));