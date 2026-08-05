import { useEffect, useRef, useState } from 'react';

interface AnimatedWeatherBackgroundProps {
  condition?: string;
}

type ParticleKind = 'rain' | 'snow';

interface Particle {
  x: number;
  y: number;
  speed: number;
  len: number;
  size: number;
  sway: number;
  swayPhase: number;
}

const PARTICLE_COUNT = 22;

const getReducedMotionQuery = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)');

export function AnimatedWeatherBackground({ condition }: AnimatedWeatherBackgroundProps) {
  const normalized = condition?.toLowerCase() ?? 'clear';
  const isRain = normalized.includes('rain') || normalized.includes('drizzle');
  const isSnow = normalized.includes('snow');
  const isStorm = normalized.includes('thunder');
  const isCloudy = normalized.includes('cloud') || normalized.includes('mist') || normalized.includes('fog');
  const isFog = normalized.includes('mist') || normalized.includes('fog') || normalized.includes('haze');
  const isClear = !isRain && !isSnow && !isStorm && !isCloudy;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(() => getReducedMotionQuery().matches);

  useEffect(() => {
    const media = getReducedMotionQuery();
    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const kind: ParticleKind | null = isRain ? 'rain' : isSnow ? 'snow' : null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const createParticle = (): Particle => {
      if (kind === 'rain') {
        return {
          x: Math.random() * canvas.clientWidth,
          y: -Math.random() * canvas.clientHeight,
          speed: 700 + Math.random() * 350,
          len: 14 + Math.random() * 10,
          size: 1,
          sway: 0,
          swayPhase: 0,
        };
      }

      return {
        x: Math.random() * canvas.clientWidth,
        y: -Math.random() * canvas.clientHeight,
        speed: 60 + Math.random() * 80,
        len: 0,
        size: 2 + Math.random() * 2.5,
        sway: 10 + Math.random() * 16,
        swayPhase: Math.random() * Math.PI * 2,
      };
    };

    const particles: Particle[] = [];
    if (kind) {
      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const particle = createParticle();
        particle.y = Math.random() * canvas.clientHeight;
        particles.push(particle);
      }
    }

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (const particle of particles) {
        if (kind === 'rain') {
          particle.y += particle.speed * dt;
          particle.x += particle.speed * 0.21 * dt;
          if (particle.y - particle.len > canvas.clientHeight) {
            particle.y = -particle.len;
            particle.x = Math.random() * canvas.clientWidth;
          }
          ctx.strokeStyle = 'rgba(165, 216, 255, 0.5)';
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.len * 0.21, particle.y - particle.len);
          ctx.stroke();
        } else if (kind === 'snow') {
          particle.y += particle.speed * dt;
          particle.swayPhase += dt * 1.6;
          particle.x += Math.sin(particle.swayPhase) * particle.sway * dt;
          if (particle.y > canvas.clientHeight + particle.size) {
            particle.y = -particle.size;
            particle.x = Math.random() * canvas.clientWidth;
          }
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    if (kind && !reduceMotion) {
      frameRef.current = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [isRain, isSnow, reduceMotion]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden${reduceMotion ? ' reduce-motion' : ''}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_86%,rgba(251,146,60,0.18),transparent_28%)]" />

      {(isCloudy || isRain || isStorm) && (
        <>
          <div className="absolute left-[-18%] top-10 h-40 w-[34rem] animate-floatCloud rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_60%)]" />
          <div className="absolute right-[-16%] top-44 h-48 w-[40rem] animate-floatCloud rounded-full bg-[radial-gradient(circle,rgba(203,213,225,0.18),transparent_60%)] [animation-delay:-7s]" />
          <div className="absolute left-[12%] top-[38%] h-36 w-[34rem] animate-floatCloud rounded-full bg-[radial-gradient(circle,rgba(207,250,254,0.12),transparent_60%)] [animation-delay:-12s]" />
        </>
      )}

      {isClear && (
        <>
          <div className="absolute right-16 top-12 h-52 w-52 animate-pulseSun rounded-full bg-[radial-gradient(circle,rgba(253,230,138,0.45),transparent_65%)]" />
          <div className="absolute right-20 top-16 h-24 w-24 animate-pulseSun rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.3),transparent_65%)] [animation-delay:-2s]" />
        </>
      )}

      {isFog && (
        <div className="absolute inset-x-[-10%] top-1/4 space-y-10 opacity-80">
          <div className="h-12 animate-driftMist rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.16),transparent_70%)]" />
          <div className="h-10 animate-driftMist rounded-full bg-[radial-gradient(ellipse,rgba(241,245,249,0.14),transparent_70%)] [animation-delay:-8s]" />
          <div className="h-14 animate-driftMist rounded-full bg-[radial-gradient(ellipse,rgba(207,250,254,0.12),transparent_70%)] [animation-delay:-14s]" />
        </div>
      )}

      {isStorm && <div className="absolute inset-0 animate-lightning bg-white/0" />}

      <canvas aria-hidden className="absolute inset-0 h-full w-full" ref={canvasRef} />
    </div>
  );
}
