const fs = require('fs');
let content = fs.readFileSync('src/engine/store.ts', 'utf-8');

const typeDef = `    addReagentToContainer: (containerId: number, reagentId: string) => void;
    flushAll: () => void;`;

const newTypeDef = `    addReagentToContainer: (containerId: number, reagentId: string) => void;
    pourContainer: (sourceId: number, targetId: number, heightDiff: number) => void;
    flushAll: () => void;`;

content = content.replace(typeDef, newTypeDef);

const flushAllStr = `    flushAll: () => {
        set({ containers: [], activeEffect: null, activeEffectContainerId: null });
    },`;

const pourMethod = `    pourContainer: (sourceId: number, targetId: number, heightDiff: number) => {
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

        // Splash effect if poured from high up
        let newEffect = (safeHeight > 250) ? 'fizz' : null;

        set({
            containers,
            ...(newEffect && { activeEffect: newEffect, activeEffectContainerId: targetId })
        });

        if (newEffect) {
             setTimeout(() => get().clearEffect(), 300);
        }
    },

    flushAll: () => {
        set({ containers: [], activeEffect: null, activeEffectContainerId: null });
    },`;

content = content.replace(flushAllStr, pourMethod);
fs.writeFileSync('src/engine/store.ts', content);
