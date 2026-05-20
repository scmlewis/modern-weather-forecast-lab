import { CalendarDays, CloudRain, Clock3, Thermometer, Wind } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DailyForecast, ForecastPoint } from '../types/weather';
import { formatDay, formatHour, roundTemp, titleCase } from '../utils/format';

interface ForecastDetailsProps {
  hourly: ForecastPoint[];
  weekly: DailyForecast[];
}

type ForecastMode = 'today' | 'week';

const dayLabel = (date: string, index: number) => {
  if (index === 0) {
    return 'Today';
  }

  if (index === 1) {
    return 'Tomorrow';
  }

  return formatDay(date).split(',')[0];
};

export function ForecastDetails({ hourly, weekly }: ForecastDetailsProps) {
  const [mode, setMode] = useState<ForecastMode>('today');

  const hourlyRows = useMemo(() => hourly.slice(0, 8), [hourly]);
  const weeklyRows = useMemo(() => weekly.slice(0, 7), [weekly]);

  return (
    <section className="glass-card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/20 pb-4 dark:border-white/10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Planning View
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            Hourly and Weekly Outlook
          </h2>
        </div>

        <div className="inline-flex w-fit rounded-full bg-white/25 p-1 dark:bg-white/10">
          {(['today', 'week'] as const).map((option) => (
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                mode === option
                  ? 'bg-slate-950 text-white shadow-lg dark:bg-sky-400 dark:text-slate-950'
                  : 'text-slate-700 hover:bg-white/30 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
              key={option}
              onClick={() => setMode(option)}
              type="button"
            >
              {option === 'today' ? <Clock3 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
              {option === 'today' ? 'Today' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'today' ? (
        <div className="mt-4 grid gap-2">
          <div className="hidden grid-cols-[1fr_0.7fr_0.9fr_0.9fr_0.9fr] px-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
            <span>Time</span>
            <span>Sky</span>
            <span>Temp</span>
            <span>Rain</span>
            <span>Wind</span>
          </div>
          {hourlyRows.map((point, index) => (
            <article
              className="grid gap-3 rounded-2xl bg-white/30 p-4 transition hover:-translate-y-0.5 hover:bg-white/45 dark:bg-white/10 dark:hover:bg-white/15 sm:grid-cols-[1fr_0.7fr_0.9fr_0.9fr_0.9fr] sm:items-center"
              key={point.time}
            >
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  {index === 0 ? 'Now' : formatHour(point.time)}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {titleCase(point.condition.description)}
                </p>
              </div>
              <div className="text-3xl" role="img" aria-label={point.condition.description}>
                {point.condition.icon}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Thermometer className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                {roundTemp(point.temperature)}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  feels {roundTemp(point.feelsLike)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CloudRain className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                {point.precipitationChance}%
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Wind className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                {point.windSpeed.toFixed(1)} m/s
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          <div className="hidden grid-cols-[1fr_0.7fr_0.9fr_0.9fr_0.9fr] px-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
            <span>Day</span>
            <span>Sky</span>
            <span>Low / High</span>
            <span>Rain</span>
            <span>Wind</span>
          </div>
          {weeklyRows.map((day, index) => (
            <article
              className="grid gap-3 rounded-2xl bg-white/30 p-4 transition hover:-translate-y-0.5 hover:bg-white/45 dark:bg-white/10 dark:hover:bg-white/15 sm:grid-cols-[1fr_0.7fr_0.9fr_0.9fr_0.9fr] sm:items-center"
              key={day.date}
            >
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  {dayLabel(day.date, index)}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {formatDay(day.date)}
                </p>
              </div>
              <div className="text-3xl" role="img" aria-label={day.condition.description}>
                {day.condition.icon}
              </div>
              <p className="text-sm font-black text-slate-950 dark:text-white">
                {roundTemp(day.min)} / {roundTemp(day.max)}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CloudRain className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                {day.precipitationSum.toFixed(1)} mm
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Wind className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                {day.maxWindSpeed.toFixed(1)} m/s
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
