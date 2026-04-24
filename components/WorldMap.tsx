'use client';

import { useEffect, useRef } from 'react';

type Point = { country: string; x: number; y: number; weight: number };

const points: Point[] = [
  { country: 'Nigeria', x: 53, y: 62, weight: 1 },
  { country: 'Ghana', x: 50, y: 63, weight: 0.9 },
  { country: 'Senegal', x: 46, y: 58, weight: 0.7 },
  { country: 'Ivory Coast', x: 49, y: 64, weight: 0.8 },
  { country: 'Mali', x: 49, y: 59, weight: 0.7 },
  { country: 'Burkina Faso', x: 50, y: 60, weight: 0.6 },
  { country: 'Togo', x: 51, y: 63, weight: 0.6 },
  { country: 'Benin', x: 52, y: 63, weight: 0.6 },
  { country: 'Russia', x: 66, y: 28, weight: 1 },
  { country: 'China', x: 78, y: 42, weight: 0.85 },
  { country: 'UAE', x: 63, y: 51, weight: 0.7 },
  { country: 'UK', x: 48, y: 32, weight: 0.7 },
  { country: 'Germany', x: 52, y: 35, weight: 0.6 },
  { country: 'Brazil', x: 33, y: 72, weight: 0.7 },
  { country: 'South Africa', x: 55, y: 82, weight: 0.75 },
];

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw dot grid (continent silhouette)
      const cols = 80;
      const rows = 40;
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const px = i / cols * 100;
          const py = j / rows * 100;

          // Continent mask (rough)
          const isLand =
            (px > 20 && px < 42 && py > 50 && py < 92) ||
            (px > 43 && px < 60 && py > 30 && py < 88) ||
            (px > 60 && px < 82 && py > 25 && py < 62) ||
            (px > 45 && px < 55 && py > 25 && py < 48) ||
            (px > 82 && px < 92 && py > 70 && py < 85);

          if (isLand) {
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.beginPath();
            ctx.arc(i * cellW + cellW / 2, j * cellH + cellH / 2, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw pulsing investor points
      points.forEach((p, idx) => {
        const cx = (p.x / 100) * rect.width;
        const cy = (p.y / 100) * rect.height;
        const pulse = Math.sin(frame / 40 + idx) * 0.3 + 0.7;

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * p.weight);
        gradient.addColorStop(0, `rgba(16,185,129,${0.4 * pulse * p.weight})`);
        gradient.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 30 * p.weight, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(52,211,153,${0.9 * pulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5 * p.weight, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full h-80 bg-zinc-950 border border-white/10 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 text-[9px] tracking-[3px] text-emerald-400/70">INVESTOR DISTRIBUTION</div>
      <div className="absolute bottom-4 right-4 text-[9px] tracking-[3px] text-white/30">15,000+ • SINCE 2019</div>
    </div>
  );
}
