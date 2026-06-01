import React, { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from './store';
import { CHEMICAL_REGISTRY } from '../data/ChemicalRegistry';

interface LabContainerProps {
    id: number;
    isDragging?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    draggingContainerId?: number | null;
}

const LabContainer: React.FC<LabContainerProps> = ({ id, isDragging, onDragStart, onDragEnd, draggingContainerId }) => {
    const container = useSimulationStore(state => state.containers.find(b => b.id === id));
    const addReagentToContainer = useSimulationStore(state => state.addReagentToContainer);
    const pourContainer = useSimulationStore(state => state.pourContainer);
    const activeEffect = useSimulationStore(state => state.activeEffect);
    const activeEffectContainerId = useSimulationStore(state => state.activeEffectContainerId);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<any[]>([]);
    const animationRef = useRef<number>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHoveredByAnother, setIsHoveredByAnother] = useState(false);
    const pourIntervalRef = useRef<any>(null);

    // Drag and Drop Logic
    const handleDragOver = (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes('containerid')) {
            // It's a container being dragged over us
            e.preventDefault();
            e.dataTransfer.dropEffect = 'none'; // We don't "drop" containers into containers, we pour on hover
            return;
        }

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
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e: React.DragEvent) => {
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
    };

    // Container Dragging
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
                containerRef.current.style.left = `${e.clientX - 60}px`;
                containerRef.current.style.top = `${e.clientY - 100}px`;
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

    // Particle Effects
    useEffect(() => {
        if (activeEffectContainerId === id && activeEffect) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const r = container?.color.r || 255;
            const g = container?.color.g || 255;
            const b = container?.color.b || 255;

            let numParticles = 15;
            let isExplosion = activeEffect === 'explosion';

            if (isExplosion) {
                numParticles = 200; // Massive particle count for explosion
                // Screen shake effect on the container wrapper
                if (containerRef.current) {
                    containerRef.current.animate([
                        { transform: 'translate(0px, 0px) rotate(0deg)' },
                        { transform: 'translate(-10px, 5px) rotate(-2deg)' },
                        { transform: 'translate(10px, -5px) rotate(2deg)' },
                        { transform: 'translate(-5px, -10px) rotate(-1deg)' },
                        { transform: 'translate(5px, 10px) rotate(1deg)' },
                        { transform: 'translate(0px, 0px) rotate(0deg)' }
                    ], { duration: 500, easing: 'ease-in-out' });
                }
            } else if (activeEffect === 'fizz') {
                numParticles = 40;
            } else if (activeEffect === 'bubbles') {
                numParticles = 25;
            }

            for(let i=0; i<numParticles; i++) {
                let color = `rgba(${Math.min(255, r+50)}, ${Math.min(255, g+50)}, ${Math.min(255, b+50)}, ${0.5 + Math.random()*0.5})`;
                let vx = (Math.random() - 0.5) * 2;
                let vy = -(1 + Math.random() * 3);
                let radius = 1 + Math.random() * 3;
                let decay = 0.01 + Math.random() * 0.02;

                if (isExplosion) {
                    // Fire colors: red, orange, yellow, white
                    const fireR = 255;
                    const fireG = Math.floor(Math.random() * 200);
                    const fireB = Math.floor(Math.random() * 50);
                    color = `rgba(${fireR}, ${fireG}, ${fireB}, ${0.8 + Math.random()*0.2})`;

                    // Explosive velocity
                    vx = (Math.random() - 0.5) * 15;
                    vy = -(5 + Math.random() * 20); // Blast upwards
                    radius = 2 + Math.random() * 6;
                    decay = 0.02 + Math.random() * 0.05; // Fade faster
                }

                // Map local container coordinates to the new canvas size (400x600, positioned bottom 0, width 400)
                // Container is roughly 140-160px wide, so its center is 200 on canvas.
                // Container height is ~200px. Liquid level height from bottom is (vol/maxVol) * 200.
                const liquidYFromBottom = (container.volume / container.maxVol) * 200;
                const spawnY = 600 - liquidYFromBottom;

                particlesRef.current.push({
                    x: isExplosion ? canvas.width/2 : canvas.width/2 + (Math.random() - 0.5) * 100,
                    y: spawnY, // Originate from liquid surface
                    vy,
                    vx,
                    radius,
                    color,
                    life: 1.0,
                    decay,
                    isExplosion
                });
            }
        }
    }, [activeEffect, activeEffectContainerId, id, container?.color, container?.volume, container?.maxVol]);

    // Particle Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Setup canvas size
        const resize = () => {
            canvas.width = 400;
            canvas.height = 600;
        };
        resize();
        window.addEventListener('resize', resize);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (!p.isExplosion) {
                    p.x += Math.sin(p.y * 0.1) * 0.5; // Wobble for bubbles
                } else {
                    p.vy += 0.5; // Gravity for explosion debris
                    p.radius *= 0.95; // Shrink fire particles
                }

                if (p.life > 0 && p.radius > 0.5) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;

                    if (p.isExplosion) {
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = p.color;
                    } else {
                        ctx.shadowBlur = 0;
                    }

                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                    ctx.shadowBlur = 0;
                } else {
                    particles.splice(i, 1);
                }
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    if (!container) return null;

    const heightPct = (container.volume / container.maxVol) * 90;
    const rgbaColor = `rgba(${container.color.r}, ${container.color.g}, ${container.color.b}, 0.8)`;
    const rgbColor = `rgb(${container.color.r}, ${container.color.g}, ${container.color.b})`;

    const label = id === 0 ? 'Alpha' : id === 1 ? 'Beta' : id === 2 ? 'Gamma' : 'Delta';
    const isFlask = container.type === 'flask';

    return (
        <div
            ref={containerRef}
            draggable
            onDragStart={handleContainerDragStart}
            onDragEnd={handleContainerDragEnd}
            onMouseDown={handlePourMouseDown}
            onMouseUp={handlePourMouseUp}
            onMouseLeave={handlePourMouseUp}
            className={`container-wrapper ${isFlask ? 'flask-wrapper' : 'beaker-wrapper'} ${isDragging ? 'opacity-80 scale-90' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="container-info font-mono text-center">
                <div className="font-bold text-cyan-300">{isFlask ? 'Flask' : 'Beaker'} {label}</div>
                <div>Vol: {container.volume} ml</div>
                <div>pH: {container.ph.toFixed(1)}</div>
            </div>

            {!isFlask ? (
                <>
                    <div className="container-glass beaker-glass"></div>
                    <div className="volume-markers">
                        <div className="marker marker-100"></div>
                        <div className="marker marker-75"></div>
                        <div className="marker marker-50"></div>
                        <div className="marker marker-25"></div>
                    </div>
                </>
            ) : (
                <>
                    <svg className="flask-glass" viewBox="0 0 160 220">
                        <defs>
                        <linearGradient id="flask-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                            <stop offset="15%" stopColor="rgba(255,255,255,0.01)" />
                            <stop offset="85%" stopColor="rgba(255,255,255,0.01)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                        </defs>
                        {/* Glass Body Outline & Fill */}
                        <path d="M 56 0 L 104 0 L 104 66 L 156 196 Q 160 206 150 214 Q 140 220 130 220 L 30 220 Q 20 220 10 214 Q 0 206 4 196 L 56 66 Z"
                            fill="url(#flask-grad)"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="3"
                            strokeLinejoin="round" />
                        {/* Left Specular Highlight */}
                        <path d="M 62 2 L 62 66 L 16 181 Q 12 191 22 199"
                            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4"
                            filter="blur(1px)" />
                        {/* Lip */}
                        <rect x="52" y="0" width="56" height="6" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    </svg>
                    <div className="volume-markers flask-markers">
                        <div className="marker marker-100"></div>
                        <div className="marker marker-50"></div>
                    </div>
                </>
            )}

            <div
                className={`container-liquid ${isFlask ? 'flask-liquid' : 'beaker-liquid'}`}
                style={{ height: `${heightPct}%`, backgroundColor: rgbaColor }}
            >
                {container.volume > 0 && (
                    <svg className="wave-svg" style={{ fill: rgbColor }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 40" preserveAspectRatio="none">
                        <path d="M0,20 Q100,40 200,20 T400,20 T600,20 T800,20 L800,40 L0,40 Z"></path>
                    </svg>
                )}
            </div>

            <canvas ref={canvasRef} className={`reaction-canvas`}></canvas>
        </div>
    );
};

export default LabContainer;
