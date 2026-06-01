const fs = require('fs');
let content = fs.readFileSync('src/engine/store.ts', 'utf-8');

// Add to SimulationState
const stateDef = `    activeEffect: 'bubbles' | 'smoke' | 'fire' | 'explosion' | 'fizz' | 'cloud' | null;
    activeEffectContainerId: number | null;`;

const newStateDef = `    activeEffect: 'bubbles' | 'smoke' | 'fire' | 'explosion' | 'fizz' | 'cloud' | null;
    activeEffectContainerId: number | null;

    // Reaction Popup
    pendingReaction: any | null;
    resolvePendingReaction: () => void;`;

content = content.replace(stateDef, newStateDef);

const initialState = `    activeEffect: null,
    activeEffectContainerId: null,

    initialize: () => {`;

const newInitialState = `    activeEffect: null,
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

    initialize: () => {`;

content = content.replace(initialState, newInitialState);

// Replace 4.2 Check for Reactions logic inside addReagentToContainer
const reactionCheck = `        // 4.2 Check for Reactions
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
        }`;

const newReactionCheck = `        // 4.2 Dynamic Reaction Rules Engine
        let triggeredReaction: any = null;

        for (const rule of REACTION_RULES) {
            const hasBase = container.contents[rule.reactants[0]] > 0;
            const hasAdded = reagentId === rule.reactants[1]; // Dropped reagent

            // If order matters, we strictly check base vs added
            if (rule.orderMatters) {
                if (hasBase && hasAdded && !container.contents[\`reacted_\${rule.reactants[0]}_\${rule.reactants[1]}\`]) {
                    triggeredReaction = rule;
                    container.contents[\`reacted_\${rule.reactants[0]}_\${rule.reactants[1]}\`] = 1;
                    break;
                }
            } else {
                // Order doesn't matter, just check if both are present
                const hasA = container.contents[rule.reactants[0]] > 0;
                const hasB = container.contents[rule.reactants[1]] > 0;

                // Trigger if dropping either reactant into a container with the other
                if ((hasA && reagentId === rule.reactants[1]) || (hasB && reagentId === rule.reactants[0])) {
                    if (!container.contents[\`reacted_\${rule.reactants[0]}_\${rule.reactants[1]}\`]) {
                        triggeredReaction = rule;
                        container.contents[\`reacted_\${rule.reactants[0]}_\${rule.reactants[1]}\`] = 1;
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
        }`;

content = content.replace(reactionCheck, newReactionCheck);
fs.writeFileSync('src/engine/store.ts', content);
