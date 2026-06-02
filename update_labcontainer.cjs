const fs = require('fs');
let content = fs.readFileSync('src/engine/LabContainer.tsx', 'utf-8');

// Add import
content = content.replace(
    "import { useSimulationStore } from './store';",
    "import { useSimulationStore } from './store';\nimport { CHEMICAL_REGISTRY } from '../data/ChemicalRegistry';"
);

// Update handleDragOver
const originalDragOver = `    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over');
    };`;

const newDragOver = `    const handleDragOver = (e: React.DragEvent) => {
        // Need to check if it's a solid trying to go into a flask
        // Since drag events don't easily let us read text data during dragOver for security reasons,
        // we will handle the actual blocking in handleDrop, but we can set the drop effect here
        // if we pass the id in the types array as a hack:
        const reagentType = Array.from(e.dataTransfer.types).find(t => t.startsWith('reagent-'));
        if (reagentType) {
            const chemId = reagentType.replace('reagent-', '');
            const chemical = CHEMICAL_REGISTRY[chemId];
            if (chemical?.type === 'solid' && container?.type === 'flask') {
                e.dataTransfer.dropEffect = 'none';
                return; // don't prevent default, so drop is not allowed
            }
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over');
    };`;

content = content.replace(originalDragOver, newDragOver);

// Update handleDrop
const originalDrop = `    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const reagentId = e.dataTransfer.getData('text/plain');
        if (reagentId) {
            addReagentToContainer(id, reagentId);
        }
    };`;

const newDrop = `    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const reagentId = e.dataTransfer.getData('text/plain');
        if (reagentId) {
            const chemical = CHEMICAL_REGISTRY[reagentId];
            if (chemical?.type === 'solid' && container?.type === 'flask') {
                console.log("Cannot put solid into a flask!");
                return;
            }
            addReagentToContainer(id, reagentId);
        }
    };`;

content = content.replace(originalDrop, newDrop);

fs.writeFileSync('src/engine/LabContainer.tsx', content);
