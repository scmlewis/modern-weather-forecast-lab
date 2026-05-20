export const getWeatherGradient = (condition?: string) => {
  const normalized = condition?.toLowerCase() ?? 'clear';

  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return 'from-slate-800 via-sky-800 to-cyan-700 dark:from-slate-950 dark:via-sky-950 dark:to-cyan-950';
  }

  if (normalized.includes('snow')) {
    return 'from-slate-200 via-sky-200 to-indigo-200 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950';
  }

  if (normalized.includes('cloud')) {
    return 'from-sky-500 via-slate-500 to-indigo-600 dark:from-slate-950 dark:via-slate-800 dark:to-indigo-950';
  }

  if (normalized.includes('thunder')) {
    return 'from-zinc-950 via-indigo-950 to-slate-800';
  }

  if (normalized.includes('mist') || normalized.includes('fog') || normalized.includes('haze')) {
    return 'from-slate-400 via-zinc-300 to-sky-300 dark:from-slate-900 dark:via-zinc-800 dark:to-sky-950';
  }

  return 'from-sky-400 via-cyan-300 to-amber-200 dark:from-slate-950 dark:via-sky-950 dark:to-amber-950';
};
