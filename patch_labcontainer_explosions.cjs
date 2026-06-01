const fs = require('fs');
let content = fs.readFileSync('src/engine/LabContainer.tsx', 'utf-8');

const oldEffect = `    // Particle Effects
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
                    color: \`rgba(\${Math.min(255, r+50)}, \${Math.min(255, g+50)}, \${Math.min(255, b+50)}, \${0.5 + Math.random()*0.5})\`,
                    life: 1.0,
                    decay: 0.01 + Math.random() * 0.02
                });
            }
        }
    }, [activeEffect, activeEffectContainerId, id, container?.color]);`;

const newEffect = `    // Particle Effects
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
                let color = \`rgba(\${Math.min(255, r+50)}, \${Math.min(255, g+50)}, \${Math.min(255, b+50)}, \${0.5 + Math.random()*0.5})\`;
                let vx = (Math.random() - 0.5) * 2;
                let vy = -(1 + Math.random() * 3);
                let radius = 1 + Math.random() * 3;
                let decay = 0.01 + Math.random() * 0.02;

                if (isExplosion) {
                    // Fire colors: red, orange, yellow, white
                    const fireR = 255;
                    const fireG = Math.floor(Math.random() * 200);
                    const fireB = Math.floor(Math.random() * 50);
                    color = \`rgba(\${fireR}, \${fireG}, \${fireB}, \${0.8 + Math.random()*0.2})\`;

                    // Explosive velocity
                    vx = (Math.random() - 0.5) * 15;
                    vy = -(5 + Math.random() * 20); // Blast upwards
                    radius = 2 + Math.random() * 6;
                    decay = 0.02 + Math.random() * 0.05; // Fade faster
                }

                particlesRef.current.push({
                    x: isExplosion ? canvas.width/2 : Math.random() * canvas.width, // Explosions originate from center
                    y: canvas.height - (container.volume / container.maxVol) * canvas.height, // Originate from liquid surface
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
    }, [activeEffect, activeEffectContainerId, id, container?.color, container?.volume, container?.maxVol]);`;

content = content.replace(oldEffect, newEffect);

const oldAnimate = `            const particles = particlesRef.current;
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
            }`;

const newAnimate = `            const particles = particlesRef.current;
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
            }`;

content = content.replace(oldAnimate, newAnimate);

fs.writeFileSync('src/engine/LabContainer.tsx', content);
