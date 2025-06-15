// components/exercises/effects/EnhancedParticleEffects.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'circle' | 'star' | 'heart' | 'triangle';
}

interface EnhancedParticleEffectsProps {
  type: 'success' | 'error' | 'celebration' | 'ambient';
  trigger?: boolean;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  onComplete?: () => void;
}

export function EnhancedParticleEffects({ 
  type, 
  trigger = false,
  duration = 2000, 
  intensity = 'medium',
  onComplete 
}: EnhancedParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      startAnimation();
      
      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [trigger, duration, onComplete]);

  const getParticleConfig = () => {
    const configs = {
      success: {
        colors: ['#48bb78', '#68d391', '#9ae6b4', '#c6f6d5', '#f0fff4'],
        count: intensity === 'low' ? 30 : intensity === 'medium' ? 60 : 100,
        speed: 3,
        gravity: 0.1,
        spread: Math.PI / 3
      },
      error: {
        colors: ['#f56565', '#fc8181', '#feb2b2', '#fed7d7', '#fff5f5'],
        count: intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 70,
        speed: 4,
        gravity: 0.05,
        spread: Math.PI / 4
      },
      celebration: {
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
        count: intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 200,
        speed: 5,
        gravity: 0.2,
        spread: Math.PI
      },
      ambient: {
        colors: ['#e6fffa', '#b2f5ea', '#81e6d9', '#4fd1c7', '#38b2ac'],
        count: intensity === 'low' ? 15 : intensity === 'medium' ? 30 : 50,
        speed: 1,
        gravity: 0.02,
        spread: Math.PI * 2
      }
    };
    
    return configs[type];
  };

  const createParticle = (x: number, y: number, config: any): Particle => {
    const angle = Math.random() * config.spread - config.spread / 2;
    const speed = config.speed * (0.5 + Math.random() * 0.5);
    const life = 60 + Math.random() * 120; // 1-3 seconds at 60fps
    
    return {
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      life,
      maxLife: life,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: 2 + Math.random() * 4,
      type: ['circle', 'star', 'heart', 'triangle'][Math.floor(Math.random() * 4)] as any
    };
  };

  const updateParticle = (particle: Particle, config: any) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += config.gravity;
    particle.vx *= 0.98; // Air resistance
    particle.life--;
    
    // Fade out as life decreases
    const alpha = particle.life / particle.maxLife;
    return alpha > 0;
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;
    
    ctx.translate(particle.x, particle.y);
    
    switch (particle.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'star':
        drawStar(ctx, particle.size);
        break;
        
      case 'heart':
        drawHeart(ctx, particle.size);
        break;
        
      case 'triangle':
        drawTriangle(ctx, particle.size);
        break;
    }
    
    ctx.restore();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, size: number) => {
    const scale = size / 10;
    ctx.beginPath();
    ctx.moveTo(0, 3 * scale);
    ctx.bezierCurveTo(-5 * scale, -2 * scale, -10 * scale, 1 * scale, 0, 8 * scale);
    ctx.bezierCurveTo(10 * scale, 1 * scale, 5 * scale, -2 * scale, 0, 3 * scale);
    ctx.fill();
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();
  };

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const config = getParticleConfig();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create initial burst of particles
    particlesRef.current = [];
    for (let i = 0; i < config.count; i++) {
      if (type === 'ambient') {
        // Spread ambient particles across screen
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particlesRef.current.push(createParticle(x, y, config));
      } else {
        // Center burst for other types
        particlesRef.current.push(createParticle(centerX, centerY, config));
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        const alive = updateParticle(particle, config);
        if (alive) {
          drawParticle(ctx, particle);
        }
        return alive;
      });
      
      // Continue animation if particles exist and effect is active
      if (particlesRef.current.length > 0 && isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
}