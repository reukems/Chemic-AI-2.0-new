import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CinematicBackground: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 20; // 20s to 40s
      const delay = Math.random() * -40; // Negative delay so they are already on screen
      const opacity = Math.random() * 0.4 + 0.2; // 0.20 to 0.60 opacity
      const size = Math.random() * 1.5 + 0.5; // 0.5rem to 2rem

      // Determine blur class based on size to create depth-of-field
      let blurClass = 'blur-sm';
      if (size < 1) blurClass = 'blur-md';
      if (size > 1.5) blurClass = 'blur-[2px]';

      return (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-[#00f3ff] pointer-events-none ${blurClass}`}
          style={{
            left: `${left}%`,
            opacity,
            width: `${size}rem`,
            height: `${size}rem`,
            bottom: '-10%',
            boxShadow: `0 0 ${size * 10}px ${size * 2}px rgba(0, 243, 255, 0.4)`
          }}
          animate={{
            y: ['0vh', '-110vh'],
            x: [0, Math.random() * 100 - 50] // drift
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
            delay: delay
          }}
        />
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0b1f38] via-[#05131f] to-[#01050a] overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

export default CinematicBackground;