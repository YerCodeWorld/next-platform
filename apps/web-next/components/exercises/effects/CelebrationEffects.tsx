// components/exercises/effects/CelebrationEffects.tsx
'use client';

import { useEffect, useState } from 'react';

interface CelebrationEffectsProps {
  type: 'confetti' | 'fireworks' | 'sparkles' | 'success' | 'error';
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  onComplete?: () => void;
}

export function CelebrationEffects({ 
  type, 
  duration = 3000, 
  intensity = 'medium',
  onComplete 
}: CelebrationEffectsProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isActive) return null;

  const getParticleCount = () => {
    switch (intensity) {
      case 'low': return 30;
      case 'medium': return 60;
      case 'high': return 100;
      default: return 60;
    }
  };

  const renderConfetti = () => {
    const particles = [];
    const count = getParticleCount();
    
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 3;
      const duration = 3 + Math.random() * 2;
      const size = 4 + Math.random() * 8;
      const color = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'][Math.floor(Math.random() * 6)];
      
      particles.push(
        <div
          key={i}
          className="confetti-particle"
          style={{
            '--delay': `${delay}s`,
            '--duration': `${duration}s`,
            '--size': `${size}px`,
            '--color': color,
            left: `${Math.random() * 100}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          } as React.CSSProperties}
        />
      );
    }
    
    return particles;
  };

  const renderFireworks = () => {
    const fireworks = [];
    const count = Math.floor(getParticleCount() / 10);
    
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 2;
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 40;
      
      fireworks.push(
        <div
          key={i}
          className="firework"
          style={{
            '--x': `${x}%`,
            '--y': `${y}%`,
            '--delay': `${delay}s`,
          } as React.CSSProperties}
        >
          {[...Array(12)].map((_, j) => (
            <div key={j} className="firework-particle" />
          ))}
        </div>
      );
    }
    
    return fireworks;
  };

  const renderSparkles = () => {
    const sparkles = [];
    const count = getParticleCount() / 2;
    
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 2;
      const size = 2 + Math.random() * 4;
      
      sparkles.push(
        <div
          key={i}
          className="sparkle"
          style={{
            '--delay': `${delay}s`,
            '--size': `${size}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${delay}s`
          } as React.CSSProperties}
        />
      );
    }
    
    return sparkles;
  };

  const renderSuccessRipple = () => (
    <div className="success-ripple">
      <div className="ripple-circle" />
      <div className="ripple-circle" />
      <div className="ripple-circle" />
    </div>
  );

  const renderErrorPulse = () => (
    <div className="error-pulse">
      <div className="pulse-circle" />
      <div className="pulse-circle" />
    </div>
  );

  return (
    <div className="celebration-effects">
      {type === 'confetti' && renderConfetti()}
      {type === 'fireworks' && renderFireworks()}
      {type === 'sparkles' && renderSparkles()}
      {type === 'success' && renderSuccessRipple()}
      {type === 'error' && renderErrorPulse()}

      <style jsx>{`
        .celebration-effects {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }

        /* Confetti Animation */
        .confetti-particle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: var(--color);
          animation: confetti-fall var(--duration) linear forwards;
          border-radius: 2px;
          opacity: 0.9;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Fireworks Animation */
        .firework {
          position: absolute;
          left: var(--x);
          top: var(--y);
          animation: firework-explode 0.5s ease-out var(--delay) forwards;
        }

        .firework-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #fff, #667eea);
          border-radius: 50%;
          animation: firework-particle 1s ease-out var(--delay) forwards;
        }

        .firework-particle:nth-child(1) { transform: rotate(0deg); }
        .firework-particle:nth-child(2) { transform: rotate(30deg); }
        .firework-particle:nth-child(3) { transform: rotate(60deg); }
        .firework-particle:nth-child(4) { transform: rotate(90deg); }
        .firework-particle:nth-child(5) { transform: rotate(120deg); }
        .firework-particle:nth-child(6) { transform: rotate(150deg); }
        .firework-particle:nth-child(7) { transform: rotate(180deg); }
        .firework-particle:nth-child(8) { transform: rotate(210deg); }
        .firework-particle:nth-child(9) { transform: rotate(240deg); }
        .firework-particle:nth-child(10) { transform: rotate(270deg); }
        .firework-particle:nth-child(11) { transform: rotate(300deg); }
        .firework-particle:nth-child(12) { transform: rotate(330deg); }

        @keyframes firework-explode {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes firework-particle {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(100px);
          }
        }

        /* Sparkles Animation */
        .sparkle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle, #fff, #f093fb);
          border-radius: 50%;
          animation: sparkle-twinkle 1s ease-in-out var(--delay) infinite;
        }

        @keyframes sparkle-twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }

        /* Success Ripple */
        .success-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .ripple-circle {
          position: absolute;
          border: 4px solid #48bb78;
          border-radius: 50%;
          animation: success-ripple 2s ease-out forwards;
        }

        .ripple-circle:nth-child(1) { animation-delay: 0s; }
        .ripple-circle:nth-child(2) { animation-delay: 0.3s; }
        .ripple-circle:nth-child(3) { animation-delay: 0.6s; }

        @keyframes success-ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 600px;
            height: 600px;
            margin-left: -300px;
            margin-top: -300px;
            opacity: 0;
          }
        }

        /* Error Pulse */
        .error-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pulse-circle {
          position: absolute;
          width: 200px;
          height: 200px;
          margin-left: -100px;
          margin-top: -100px;
          border: 4px solid #f56565;
          border-radius: 50%;
          animation: error-pulse 0.6s ease-out forwards;
        }

        .pulse-circle:nth-child(2) {
          animation-delay: 0.2s;
        }

        @keyframes error-pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        /* Additional sparkle variants */
        .sparkle:nth-child(2n) {
          background: radial-gradient(circle, #fff, #667eea);
          animation-duration: 1.5s;
        }

        .sparkle:nth-child(3n) {
          background: radial-gradient(circle, #fff, #4facfe);
          animation-duration: 0.8s;
        }

        .sparkle:nth-child(4n) {
          background: radial-gradient(circle, #fff, #f5576c);
          animation-duration: 1.2s;
        }

        /* Confetti variants */
        .confetti-particle:nth-child(2n) {
          transform: rotateX(45deg);
        }

        .confetti-particle:nth-child(3n) {
          border-radius: 50%;
        }

        .confetti-particle:nth-child(4n) {
          transform: rotateY(45deg);
        }

        .confetti-particle:nth-child(5n) {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .confetti-particle:nth-child(6n) {
          clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
        }
      `}</style>
    </div>
  );
}