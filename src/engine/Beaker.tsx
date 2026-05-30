import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from './store';

interface BeakerProps {
    id: number;
}

const Beaker: React.FC<BeakerProps> = ({ id }) => {
    const beaker = useSimulationStore(state => state.beakers.find(b => b.id === id));
    const addReagentToBeaker = useSimulationStore(state => state.addReagentToBeaker);
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
            addReagentToBeaker(id, reagentId);
        }
    };

    // Particle Effects
    useEffect(() => {
        if (activeEffectContainerId === id && activeEffect) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const r = beaker?.color.r || 255;
            const g = beaker?.color.g || 255;
            const b = beaker?.color.b || 255;

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
    }, [activeEffect, activeEffectContainerId, id, beaker?.color]);

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

    if (!beaker) return null;

    const heightPct = (beaker.volume / beaker.maxVol) * 90;
    const rgbaColor = `rgba(${beaker.color.r}, ${beaker.color.g}, ${beaker.color.b}, 0.8)`;
    const rgbColor = `rgb(${beaker.color.r}, ${beaker.color.g}, ${beaker.color.b})`;

    const label = id === 0 ? 'Alpha' : id === 1 ? 'Beta' : 'Gamma';

    return (
        <div
            className="beaker-container"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="beaker-info font-mono text-center">
                <div className="font-bold text-cyan-300">Beaker {label}</div>
                <div>Vol: {beaker.volume} ml</div>
                <div>pH: {beaker.ph.toFixed(1)}</div>
            </div>

            <div className="beaker-glass"></div>
            <canvas ref={canvasRef} className="reaction-canvas"></canvas>

            <div
                className="beaker-liquid"
                style={{ height: `${heightPct}%`, backgroundColor: rgbaColor }}
            >
                {beaker.volume > 0 && (
                    <svg className="wave-svg" style={{ fill: rgbColor }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 40" preserveAspectRatio="none">
                        <path d="M0,20 Q100,40 200,20 T400,20 T600,20 T800,20 L800,40 L0,40 Z"></path>
                    </svg>
                )}
            </div>
        </div>
    );
};

export default Beaker;
