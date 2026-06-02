const fs = require('fs');
let content = fs.readFileSync('src/engine/LabContainer.tsx', 'utf-8');

const interfaceDef = `interface LabContainerProps {
    id: number;
}`;

const newInterfaceDef = `interface LabContainerProps {
    id: number;
    isDragging?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    draggingContainerId?: number | null;
}`;

content = content.replace(interfaceDef, newInterfaceDef);

content = content.replace(
    "const LabContainer: React.FC<LabContainerProps> = ({ id }) => {",
    "const LabContainer: React.FC<LabContainerProps> = ({ id, isDragging, onDragStart, onDragEnd, draggingContainerId }) => {"
);

const hooksStr = `    const addReagentToContainer = useSimulationStore(state => state.addReagentToContainer);
    const activeEffect = useSimulationStore(state => state.activeEffect);
    const activeEffectContainerId = useSimulationStore(state => state.activeEffectContainerId);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<any[]>([]);
    const animationRef = useRef<number>();`;

const newHooksStr = `    const addReagentToContainer = useSimulationStore(state => state.addReagentToContainer);
    const pourContainer = useSimulationStore(state => state.pourContainer);
    const activeEffect = useSimulationStore(state => state.activeEffect);
    const activeEffectContainerId = useSimulationStore(state => state.activeEffectContainerId);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<any[]>([]);
    const animationRef = useRef<number>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHoveredByAnother, setIsHoveredByAnother] = useState(false);
    const pourIntervalRef = useRef<any>(null);`;

content = content.replace(hooksStr, newHooksStr);
content = content.replace("import React, { useEffect, useRef } from 'react';", "import React, { useEffect, useRef, useState } from 'react';");

// Update handleDragOver to allow container types
const handleDragOver = `        // Need to check if it's a solid trying to go into a flask
        // Since drag events don't easily let us read text data during dragOver for security reasons,
        // we will handle the actual blocking in handleDrop, but we can set the drop effect here
        // if we pass the id in the types array as a hack:
        const reagentType = Array.from(e.dataTransfer.types).find(t => t.startsWith('reagent-'));`;

const newHandleDragOver = `        if (e.dataTransfer.types.includes('containerid')) {
            // It's a container being dragged over us
            e.preventDefault();
            e.dataTransfer.dropEffect = 'none'; // We don't "drop" containers into containers, we pour on hover
            return;
        }

        // Need to check if it's a solid trying to go into a flask
        // Since drag events don't easily let us read text data during dragOver for security reasons,
        // we will handle the actual blocking in handleDrop, but we can set the drop effect here
        // if we pass the id in the types array as a hack:
        const reagentType = Array.from(e.dataTransfer.types).find(t => t.startsWith('reagent-'));`;

content = content.replace(handleDragOver, newHandleDragOver);

// Insert dragging and pouring logic before Particle Effects
const particleEffects = `    // Particle Effects`;
const draggingLogic = `    // Container Dragging
    const handleContainerDragStart = (e: React.DragEvent) => {
        if (container?.volume === 0) {
            // Can't pour an empty container
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('containerid', id.toString());

        // Hide standard drag image so we can move the actual div
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);

        if (onDragStart) onDragStart();
    };

    const handleContainerDragEnd = (e: React.DragEvent) => {
        if (onDragEnd) onDragEnd();
    };

    // Pouring logic
    const handlePourMouseDown = (e: React.MouseEvent) => {
        // If someone is dragging a container and mouses down on US, they want to pour
        if (draggingContainerId !== null && draggingContainerId !== id) {
            // Calculate height diff (very roughly based on Y mouse pos within our div, though usually we measure absolute div positions)
            const rect = e.currentTarget.getBoundingClientRect();
            const heightDiff = e.clientY - rect.top; // Higher up on the beaker = less diff, deeper = more diff

            // In a real implementation we'd track continuous mouse down. For simplicity, let's use an interval
            if (pourIntervalRef.current) clearInterval(pourIntervalRef.current);
            pourIntervalRef.current = setInterval(() => {
                pourContainer(draggingContainerId, id, 500 - Math.min(e.clientY, 500));
            }, 100);
        }
    };

    const handlePourMouseUp = () => {
        if (pourIntervalRef.current) {
            clearInterval(pourIntervalRef.current);
            pourIntervalRef.current = null;
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && containerRef.current) {
                containerRef.current.style.position = 'fixed';
                containerRef.current.style.left = \`\${e.clientX - 60}px\`;
                containerRef.current.style.top = \`\${e.clientY - 100}px\`;
                containerRef.current.style.zIndex = '100';
                containerRef.current.style.pointerEvents = 'none'; // pass events to target underneath
                containerRef.current.style.transform = 'rotate(-30deg)';
                containerRef.current.style.transition = 'none'; // remove smooth transition while dragging
            } else if (!isDragging && containerRef.current) {
                containerRef.current.style.position = 'relative';
                containerRef.current.style.left = 'auto';
                containerRef.current.style.top = 'auto';
                containerRef.current.style.zIndex = '10';
                containerRef.current.style.pointerEvents = 'auto';
                containerRef.current.style.transform = 'none';
                containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            // Also listen to global mouse up to stop pouring if dragged off
            window.addEventListener('mouseup', handlePourMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handlePourMouseUp);
        };
    }, [isDragging]);

    // Particle Effects`;

content = content.replace(particleEffects, draggingLogic);

const divWrapper = `        <div
            className={\`container-wrapper \${isFlask ? 'flask-wrapper' : 'beaker-wrapper'}\`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >`;

const newDivWrapper = `        <div
            ref={containerRef}
            draggable
            onDragStart={handleContainerDragStart}
            onDragEnd={handleContainerDragEnd}
            onMouseDown={handlePourMouseDown}
            onMouseUp={handlePourMouseUp}
            onMouseLeave={handlePourMouseUp}
            className={\`container-wrapper \${isFlask ? 'flask-wrapper' : 'beaker-wrapper'} \${isDragging ? 'opacity-80 scale-90' : ''}\`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >`;

content = content.replace(divWrapper, newDivWrapper);

fs.writeFileSync('src/engine/LabContainer.tsx', content);
