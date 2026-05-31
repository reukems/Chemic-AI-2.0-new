import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from './store';

interface LabContainerProps {
    id: number;
}

const LabContainer: React.FC<LabContainerProps> = ({ id }) => {
    const container = useSimulationStore(state => state.containers.find(b => b.id === id));
    const addReagentToContainer = useSimulationStore(state => state.addReagentToContainer);
    const activeEffect = useSimulationStore(state => state.activeEffect);
    const activeEffectContainerId = useSimulationStore(state => state.activeEffectContainerId);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<any[]>([]);
    const animationRef = useRef<number>();

    // Drag and Drop Logic
    const handleDragOver = (e: React.DragEvent) => {
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
            addReagentToContainer(id, reagentId);
        }
    };

    // Particle Effects
    useEffect(() => {
        if (activeEffectContainerId === id && activeEffect) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const r = container?.color.r || 255;
            const g = container?.color.g || 255;
            const b = container?.color.b || 255;

            const numParticles = activeEffect === 'fizz' ? 30 : 15;

            for(let i=0; i<numParticles; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height,
                    vy: -(1 + Math.random() * 2),
                    vx: (Math.random() - 0.5) * 0.5,
                    radius: 1 + Math.random() * 3,
                    color: `rgba(${Math.min(255, r+50)}, ${Math.min(255, g+50)}, ${Math.min(255, b+50)}, ${0.5 + Math.random()*0.5})`,
                    life: 1.0,
                    decay: 0.01 + Math.random() * 0.02
                });
            }
        }
    }, [activeEffect, activeEffectContainerId, id, container?.color]);

    // Particle Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        const resize = () => {
            if (canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width - 6;
                canvas.height = rect.height - 6;
            }
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
                p.x += Math.sin(p.y * 0.1) * 0.5;

                if (p.life > 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
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
            className={`container-wrapper ${isFlask ? 'flask-wrapper' : 'beaker-wrapper'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="container-info font-mono text-center">
                <div className="font-bold text-cyan-300">{isFlask ? 'Flask' : 'Beaker'} {label}</div>
                <div>Vol: {container.volume} ml</div>
                <div>pH: {container.ph.toFixed(1)}</div>
            </div>

            <div className={`container-glass ${isFlask ? 'flask-glass' : 'beaker-glass'}`}>
                {/* Volume Markers for Beaker */}
                {!isFlask && (
                    <div className="volume-markers">
                        <div className="marker marker-100"></div>
                        <div className="marker marker-75"></div>
                        <div className="marker marker-50"></div>
                        <div className="marker marker-25"></div>
                    </div>
                )}
                {/* Volume Markers for Flask */}
                {isFlask && (
                    <div className="volume-markers flask-markers">
                        <div className="marker marker-100"></div>
                        <div className="marker marker-50"></div>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className={`reaction-canvas ${isFlask ? 'flask-canvas' : ''}`}></canvas>

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
        </div>
    );
};

export default LabContainer;
