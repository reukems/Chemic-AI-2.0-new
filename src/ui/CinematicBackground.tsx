import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FORMULAS = [
  'C₆H₁₂O₆', 'H₂O', 'CO₂', 'NaCl', 'NH₃', 'CH₄', 'H₂SO₄', 'O₂', 'N₂', 'HCl', 'C₂H₅OH', 'ATP'
];

const CinematicBackground: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const formula = FORMULAS[Math.floor(Math.random() * FORMULAS.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 20; // 20s to 40s
      const delay = Math.random() * -40; // Negative delay so they are already on screen
      const opacity = Math.random() * 0.15 + 0.05; // 0.05 to 0.20 opacity
      const fontSize = Math.random() * 1.5 + 1; // 1rem to 2.5rem

      // Determine blur class based on size to create depth-of-field
      let blurClass = 'blur-sm';
      if (fontSize < 1.3) blurClass = 'blur-md';
      if (fontSize < 1.1) blurClass = 'blur-xl';
      if (fontSize > 2.0) blurClass = 'blur-[1px]';

      return (
        <motion.div
          key={i}
          className={`absolute text-cyan-400/50 font-mono pointer-events-none whitespace-nowrap ${blurClass}`}
          style={{
            left: `${left}%`,
            opacity,
            fontSize: `${fontSize}rem`,
            bottom: '-10%',
          }}
          animate={{
            y: ['0vh', '-110vh'],
            rotate: [0, Math.random() * 60 - 30]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
            delay: delay
          }}
        >
          {formula}
        </motion.div>
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#05131f] to-[#01050a] overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

export default CinematicBackground;
