import React, { useEffect, useRef } from 'react';

interface BackgroundHelixProps {
  reducedMotion?: boolean;
  density?: 'low' | 'medium' | 'high';
}

export const BackgroundHelix: React.FC<BackgroundHelixProps> = ({
  reducedMotion = false,
  density = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle field
    const particleCount = density === 'low' ? 35 : density === 'high' ? 90 : 60;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      hue: Math.random() > 0.6 ? 280 : 190, // Cyan or Violet
    }));

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint perspective grid floor at bottom
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.lineWidth = 1;
      const gridY = height * 0.82;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(width / 2 + (x - width / 2) * 0.2, gridY);
        ctx.stroke();
      }
      for (let y = gridY; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating particles
      particles.forEach((p) => {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stylized DNA Double Helix Silhouette in background (right third)
      const helixCenterX = width * 0.85;
      const helixPoints = 32;
      const helixSpan = height * 0.9;
      const stepY = helixSpan / helixPoints;
      const startY = height * 0.05;
      const helixRadius = 55;

      for (let i = 0; i < helixPoints; i++) {
        const y = startY + i * stepY;
        const currentAngle = angle + i * 0.28;

        const x1 = helixCenterX + Math.cos(currentAngle) * helixRadius;
        const x2 = helixCenterX + Math.cos(currentAngle + Math.PI) * helixRadius;
        const z1 = Math.sin(currentAngle);
        const z2 = Math.sin(currentAngle + Math.PI);

        // Strand connector rung
        if (i % 2 === 0) {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }

        // Node 1
        const alpha1 = (z1 + 1) * 0.12 + 0.04;
        ctx.fillStyle = `rgba(34, 211, 238, ${alpha1})`;
        ctx.beginPath();
        ctx.arc(x1, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node 2
        const alpha2 = (z2 + 1) * 0.12 + 0.04;
        ctx.fillStyle = `rgba(232, 121, 249, ${alpha2})`;
        ctx.beginPath();
        ctx.arc(x2, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        angle += 0.008;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion, density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
