const fs = require('fs');
let content = fs.readFileSync('src/engine/store.ts', 'utf-8');

// Also update pourContainer to check for dynamic reactions
const pourEffectCheck = `        // Splash effect if poured from high up
        let newEffect = (safeHeight > 250) ? 'fizz' : null;

        set({
            containers,
            ...(newEffect && { activeEffect: newEffect, activeEffectContainerId: targetId })
        });

        if (newEffect) {
             setTimeout(() => get().clearEffect(), 300);
        }`;

const newPourEffectCheck = `        // Dynamic Reaction Rules Engine for Pouring
        let triggeredReaction: any = null;

        // Check if any newly mixed chemicals trigger a reaction
        for (const rule of REACTION_RULES) {
            const r0 = rule.reactants[0];
            const r1 = rule.reactants[1];

            if (rule.orderMatters) {
                // Was r1 poured into r0?
                if (target.contents[r0] > 0 && source.contents[r1] > 0 && !target.contents[\`reacted_\${r0}_\${r1}\`]) {
                    triggeredReaction = rule;
                    target.contents[\`reacted_\${r0}_\${r1}\`] = 1;
                    break;
                }
            } else {
                if (target.contents[r0] > 0 && source.contents[r1] > 0 && !target.contents[\`reacted_\${r0}_\${r1}\`]) {
                    triggeredReaction = rule;
                    target.contents[\`reacted_\${r0}_\${r1}\`] = 1;
                    break;
                }
                if (target.contents[r1] > 0 && source.contents[r0] > 0 && !target.contents[\`reacted_\${r1}_\${r0}\`]) {
                    triggeredReaction = rule;
                    target.contents[\`reacted_\${r1}_\${r0}\`] = 1;
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
        }`;

content = content.replace(pourEffectCheck, newPourEffectCheck);
fs.writeFileSync('src/engine/store.ts', content);
