import React, { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from './store';
import { CHEMICAL_REGISTRY } from '../data/ChemicalRegistry';

const LabCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { containers, mergeContainers, setDraggedContainer, draggedContainerId } = useSimulationStore();

    // Internal state for positions
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Initialize positions for new containers
        const newPositions = { ...positions };
        let changed = false;

        containers.forEach((c, index) => {
            if (!newPositions[c.id]) {
                const shelfY = window.innerHeight - 200; // Put them lower down to match image
                newPositions[c.id] = {
                    x: window.innerWidth / 2 + (index * 150) - ((containers.length - 1) * 75),
                    y: shelfY
                };
                changed = true;
            }
        });

        // Remove positions for deleted containers
        Object.keys(newPositions).forEach(id => {
            if (!containers.find(c => c.id === id)) {
                delete newPositions[id];
                changed = true;
            }
        });

        if (changed) setPositions(newPositions);
    }, [containers]);

    // Handle Animation & Drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            // Resize canvas to window
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Pure 2D Flat Background (Dark solid color to match image)
            ctx.fillStyle = '#0f1423';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const shelfY = canvas.height - 200;

            // Draw a flat shelf line
            ctx.fillStyle = '#181f33';
            ctx.fillRect(0, shelfY + 45, canvas.width, canvas.height - (shelfY + 45));
            ctx.strokeStyle = '#232b43';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, shelfY + 45);
            ctx.lineTo(canvas.width, shelfY + 45);
            ctx.stroke();

            // Draw Containers (Beakers)
            containers.forEach(c => {
                const pos = positions[c.id];
                if (!pos) return;

                const isDragged = draggedContainerId === c.id;
                const x = isDragged ? mousePos.x : pos.x;
                const y = isDragged ? mousePos.y : pos.y;

                const chem = c.chemicalId ? CHEMICAL_REGISTRY[c.chemicalId] : null;

                // Beaker Dimensions - match reference proportions
                const beakerW = 80;
                const beakerH = 110;
                const radius = 8;

                // Back glass of beaker
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.beginPath();
                ctx.roundRect(x - beakerW/2, y - beakerH/2, beakerW, beakerH, radius);
                ctx.fill();

                // Liquid - Flat fill
                if (chem) {
                    const fillRatio = Math.min(c.volume / 100, 1);
                    // Liquid fills from bottom
                    const fillHeight = fillRatio * (beakerH - 4);

                    ctx.save();
                    // Clip to beaker inner shape
                    ctx.beginPath();
                    ctx.roundRect(x - beakerW/2 + 2, y - beakerH/2 + 2, beakerW - 4, beakerH - 4, radius - 1);
                    ctx.clip();

                    // Liquid fill - nice solid gradient
                    const liquidGrad = ctx.createLinearGradient(x, y + beakerH/2, x, y + beakerH/2 - fillHeight);
                    liquidGrad.addColorStop(0, chem.color);

                    // Lighten color slightly for top
                    const lighten = (color: string) => {
                        // Assuming simple hex or rgb, just default to white for simplicity here
                        return '#ffffff';
                    };
                    liquidGrad.addColorStop(1, '#ffffff');

                    ctx.fillStyle = liquidGrad;
                    // Draw liquid
                    ctx.globalAlpha = 0.9;
                    ctx.fillRect(x - beakerW/2, y + beakerH/2 - fillHeight, beakerW, fillHeight);

                    // Liquid top surface line
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x - beakerW/2, y + beakerH/2 - fillHeight, beakerW, 2);

                    ctx.restore();
                }

                // Front glass reflection - Nice diagonal slash from image
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(x - beakerW/2, y - beakerH/2, beakerW, beakerH, radius);
                ctx.clip();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.moveTo(x - beakerW/2 - 10, y - beakerH/2);
                ctx.lineTo(x - beakerW/2 + 15, y - beakerH/2);
                ctx.lineTo(x - beakerW/2 - 5, y + beakerH/2);
                ctx.lineTo(x - beakerW/2 - 30, y + beakerH/2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // Beaker border/rim - crisp white stroke
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(x - beakerW/2, y - beakerH/2, beakerW, beakerH, radius);
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [containers, positions, draggedContainerId, mousePos]);

    // Mouse Interactions
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on a container
        const clickedId = Object.entries(positions).find(([id, pos]) => {
            return Math.abs(x - pos.x) < 40 && Math.abs(y - pos.y) < 55;
        })?.[0];

        if (clickedId) {
            setDraggedContainer(clickedId);
            setMousePos({ x, y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedContainerId) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseUp = () => {
        if (!draggedContainerId) return;

        // Check for drop collisions
        const targetId = Object.entries(positions).find(([id, pos]) => {
            if (id === draggedContainerId) return false;
            // Distance check
            const dist = Math.hypot(mousePos.x - pos.x, mousePos.y - pos.y);
            return dist < 80;
        })?.[0];

        if (targetId) {
            mergeContainers(draggedContainerId, targetId);
        } else {
            // Snap back to shelf height if dropped near it
            const shelfY = window.innerHeight - 200;
            let finalY = mousePos.y;
            if (Math.abs(mousePos.y - shelfY) < 100) {
                finalY = shelfY;
            }

            setPositions(prev => ({
                ...prev,
                [draggedContainerId]: { x: mousePos.x, y: finalY }
            }));
        }

        setDraggedContainer(null);
    };

    return (
        <canvas
            ref={canvasRef}
            className="block w-full h-full cursor-crosshair absolute inset-0 -z-20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
};

export default LabCanvas;
