import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Ember {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * Braises dorées flottantes (v2 dynamisme) : quelques dizaines de particules
 * qui dérivent lentement vers le haut, façon poussière de bataille. Un seul
 * canvas, rendu en `requestAnimationFrame`, mis en pause quand l'onglet est
 * caché. Désactivé sous `prefers-reduced-motion` et sur petit écran (mobile).
 */
export function EmberField() {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Sprite de braise pré-rendu (glow radial) — dessiné une fois puis
    // recopié par drawImage, bien moins coûteux qu'un gradient par particule.
    const sprite = document.createElement('canvas');
    sprite.width = 32;
    sprite.height = 32;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(245,203,92,0.9)');
      g.addColorStop(0.4, 'rgba(232,176,67,0.5)');
      g.addColorStop(1, 'rgba(232,176,67,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 32, 32);
    }

    let width = 0;
    let height = 0;
    const embers: Ember[] = [];
    let raf = 0;
    let last = performance.now();

    function makeEmber(anywhere: boolean): Ember {
      const maxLife = 7000 + Math.random() * 9000;
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : height + 12,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.006,
        vy: -(0.02 + Math.random() * 0.045),
        life: anywhere ? Math.random() * maxLife : 0,
        maxLife,
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = width < 640 ? 0 : Math.round(Math.min(42, width / 44));
      while (embers.length < target) embers.push(makeEmber(true));
      if (embers.length > target) embers.length = target;
    }

    function alphaFor(e: Ember): number {
      const t = e.life / e.maxLife;
      if (t < 0.15) return (t / 0.15) * 0.6;
      if (t > 0.75) return ((1 - t) / 0.25) * 0.6;
      return 0.6;
    }

    function frame(now: number) {
      const dt = Math.min(48, now - last);
      last = now;
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.life >= e.maxLife || e.y < -12) {
          embers[i] = makeEmber(false);
          continue;
        }
        const size = e.r * 10;
        ctx!.globalAlpha = alphaFor(e);
        ctx!.drawImage(sprite, e.x - size / 2, e.y - size / 2, size, size);
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      cancelAnimationFrame(raf);
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce]);

  if (reduce) return null;
  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
