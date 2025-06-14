// components/exercises/effects/ParticleEffects.tsx
'use client';

import { useEffect, useState } from 'react';

interface ParticleEffectsProps {
  type: 'success' | 'error';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  emoji: string;
  size: number;
}

export function ParticleEffects({ type }: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create particles based on type
    const newParticles: Particle[] = [];
    const particleCount = type === 'success' ? 20 : 10;
    const emojis = type === 'success' 
      ? ['🎉', '⭐', '✨', '🌟', '💫', '🎊'] 
      : ['💥', '❌', '💢', '😓'];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.random() * 20 + 20
      });
    }

    setParticles(newParticles);

    // Animate particles
    const animationFrame = () => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0)
      );
    };

    const intervalId = setInterval(animationFrame, 16); // 60fps

    // Clean up after 2 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setParticles([]);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [type]);

  // Trigger haptic feedback on mobile
  useEffect(() => {
    if ('vibrate' in navigator) {
      if (type === 'success') {
        navigator.vibrate([50, 50, 50]); // Three short pulses
      } else {
        navigator.vibrate(200); // One long pulse
      }
    }
  }, [type]);

  return (
    <div className="particle-effects fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute transition-opacity duration-200"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: particle.size,
            opacity: particle.life,
            transform: `translate(-50%, -50%) rotate(${particle.vx * 10}deg)`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Fullscreen flash effect */}
      <div 
        className={`
          absolute inset-0 pointer-events-none animate-pulse
          ${type === 'success' 
            ? 'bg-green-200' 
            : 'bg-red-200'
          }
        `}
        style={{
          opacity: 0.1,
          animation: 'flash 0.3s ease-out'
        }}
      />

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0.3; }
          50% { opacity: 0.1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}