import React, { useEffect, useRef } from 'react';

interface FallingPetalsProps {
  enabled?: boolean;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  color: string;
}

export function FallingPetals({ enabled = true }: FallingPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palette: delicate white and soft blushing cherry/ivory petals
    const petalColors = [
      'rgba(255, 255, 255, 0.85)',
      'rgba(254, 242, 242, 0.85)',
      'rgba(255, 241, 242, 0.8)',
      'rgba(253, 238, 238, 0.75)',
      'rgba(250, 245, 240, 0.85)',
      'rgba(255, 235, 238, 0.7)',
    ];

    const PETAL_COUNT = Math.min(36, Math.floor(width / 35));
    const petals: Petal[] = [];

    const createPetal = (initialY?: number): Petal => {
      const size = 11 + Math.random() * 10;
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : -20 - Math.random() * 50,
        size,
        speedY: 0.8 + Math.random() * 1.4,
        speedX: -0.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.015 + Math.random() * 0.02,
        opacity: 0.45 + Math.random() * 0.45,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
      };
    };

    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push(createPetal(Math.random() * height));
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // Simulate 3D tumbling by scaling along Y axis
      ctx.scale(1, Math.cos(p.flip));

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.shadowColor = 'rgba(230, 215, 215, 0.25)';
      ctx.shadowBlur = 4;

      // Realistic teardrop/oval curved petal shape
      const r = p.size;
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.75, -r * 0.5, r * 0.85, r * 0.5, 0, r);
      ctx.bezierCurveTo(-r * 0.85, r * 0.5, -r * 0.75, -r * 0.5, 0, -r);
      ctx.fill();

      // Subtle center vein
      ctx.strokeStyle = 'rgba(240, 210, 215, 0.35)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.lineTo(0, r * 0.7);
      ctx.stroke();

      ctx.restore();
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY * delta;
        p.x += (p.speedX + Math.sin(p.y * 0.008)) * delta;
        p.angle += p.angularSpeed * delta;
        p.flip += p.flipSpeed * delta;

        // Wrap around bottom
        if (p.y > height + 20) {
          petals[i] = createPetal(-20);
        }
        // Wrap around sides
        if (p.x > width + 20) p.x = -20;
        else if (p.x < -20) p.x = width + 20;

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
