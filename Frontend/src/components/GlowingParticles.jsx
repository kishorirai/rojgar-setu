import React from 'react';

const PARTICLE_COLORS = [
  'rgba(168,85,247,0.25)', // purple-500
  'rgba(99,102,241,0.18)', // indigo-500
  'rgba(236,72,153,0.15)', // pink-500
  'rgba(255,255,255,0.10)', // white
];

const random = (min, max) => Math.random() * (max - min) + min;

const GlowingParticles = () => {
  const particles = Array.from({ length: 18 }).map((_, i) => {
    const size = random(40, 110);
    const top = random(0, 90);
    const left = random(0, 90);
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const duration = random(6, 16);
    const delay = random(0, 8);
    return (
      <span
        key={i}
        style={{
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          background: color,
          borderRadius: '50%',
          filter: 'blur(12px)',
          opacity: 0.7,
          animation: `particle-float ${duration}s ease-in-out ${delay}s infinite alternate`,
        }}
      />
    );
  });

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes particle-float {
          0% { transform: translateY(0px) scale(1); opacity: 0.7; }
          100% { transform: translateY(-40px) scale(1.15); opacity: 1; }
        }
      `}</style>
      {particles}
    </div>
  );
};

export default GlowingParticles; 