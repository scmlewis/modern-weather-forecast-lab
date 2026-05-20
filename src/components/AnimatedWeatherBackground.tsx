interface AnimatedWeatherBackgroundProps {
  condition?: string;
}

export function AnimatedWeatherBackground({ condition }: AnimatedWeatherBackgroundProps) {
  const normalized = condition?.toLowerCase() ?? 'clear';
  const isRain = normalized.includes('rain') || normalized.includes('drizzle');
  const isSnow = normalized.includes('snow');
  const isStorm = normalized.includes('thunder');
  const isCloudy = normalized.includes('cloud') || normalized.includes('mist') || normalized.includes('fog');
  const isFog = normalized.includes('mist') || normalized.includes('fog') || normalized.includes('haze');
  const isClear = !isRain && !isSnow && !isStorm && !isCloudy;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_86%,rgba(251,146,60,0.18),transparent_28%)]" />

      {(isCloudy || isRain || isStorm) && (
        <>
          <div className="absolute left-[-18%] top-10 h-40 w-[34rem] animate-floatCloud rounded-full bg-white/18 blur-3xl" />
          <div className="absolute right-[-16%] top-44 h-48 w-[40rem] animate-floatCloud rounded-full bg-slate-200/18 blur-3xl [animation-delay:-7s]" />
          <div className="absolute left-[12%] top-[38%] h-36 w-[34rem] animate-floatCloud rounded-full bg-cyan-100/12 blur-3xl [animation-delay:-12s]" />
        </>
      )}

      {isClear && (
        <>
          <div className="absolute right-16 top-12 h-52 w-52 animate-pulseSun rounded-full bg-amber-200/45 blur-2xl" />
          <div className="absolute right-20 top-16 h-24 w-24 animate-pulseSun rounded-full bg-white/30 blur-xl [animation-delay:-2s]" />
        </>
      )}

      {isFog && (
        <div className="absolute inset-x-[-10%] top-1/4 space-y-10 opacity-80">
          <div className="h-12 animate-driftMist rounded-full bg-white/16 blur-2xl" />
          <div className="h-10 animate-driftMist rounded-full bg-slate-100/14 blur-2xl [animation-delay:-8s]" />
          <div className="h-14 animate-driftMist rounded-full bg-cyan-100/12 blur-3xl [animation-delay:-14s]" />
        </div>
      )}

      {isRain &&
        Array.from({ length: 52 }).map((_, index) => {
          const duration = 0.85 + (index % 5) * 0.12;

          return (
            <span
              className="absolute top-[-18%] h-32 w-px animate-rainFall bg-cyan-100/50"
              key={index}
              style={{
                left: `${(index * 2.35) % 100}%`,
                animationDelay: `${index * 0.055}s`,
                animationDuration: `${duration}s`,
                transform: 'rotate(12deg)',
              }}
            />
          );
        })}

      {isSnow &&
        Array.from({ length: 42 }).map((_, index) => (
          <span
            className="absolute top-[-8%] h-2 w-2 animate-snowFall rounded-full bg-white/75 blur-[1px]"
            key={index}
            style={{
              left: `${(index * 3.7) % 100}%`,
              animationDelay: `${index * 0.16}s`,
              animationDuration: `${5 + (index % 6)}s`,
            }}
          />
        ))}

      {isStorm && (
        <div className="absolute inset-0 animate-lightning bg-white/0" />
      )}
    </div>
  );
}
