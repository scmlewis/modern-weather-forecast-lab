import { Droplets, Eye, MapPin, Wind } from 'lucide-react';
import type { CurrentWeather } from '../types/weather';
import { formatSpeed, formatTime, roundTemp, titleCase } from '../utils/format';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
}

export function CurrentWeatherCard({ weather }: CurrentWeatherCardProps) {
  const details = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${weather.humidity}%`,
    },
    {
      icon: Wind,
      label: 'Wind',
      value: formatSpeed(weather.windSpeed),
    },
    {
      icon: Eye,
      label: 'Condition',
      value: titleCase(weather.condition.main),
    },
  ];

  return (
    <section className="glass-card min-h-full p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <MapPin className="h-4 w-4" />
            <span>
              {weather.name}, {weather.country}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {titleCase(weather.condition.description)}
          </p>
        </div>
        <div
          aria-label={weather.condition.description}
          className="grid h-20 w-20 place-items-center text-6xl drop-shadow-lg"
          role="img"
        >
          {weather.condition.icon}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-end">
        <div>
          <p className="text-7xl font-black leading-none text-slate-950 dark:text-white sm:text-8xl">
            {roundTemp(weather.temperature)}
          </p>
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
            Feels like {roundTemp(weather.feelsLike)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {details.map(({ icon: Icon, label, value }, index) => (
            <div
              className={`rounded-2xl bg-white/25 p-3 dark:bg-white/10 ${
                index === details.length - 1 ? 'col-span-2 sm:col-span-1' : ''
              }`}
              key={label}
            >
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
              </div>
              <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/30 p-4 dark:bg-white/10">
          <p className="text-slate-600 dark:text-slate-300">Sunrise</p>
          <p className="mt-1 font-bold text-slate-950 dark:text-white">
            {formatTime(weather.sunrise)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/30 p-4 dark:bg-white/10">
          <p className="text-slate-600 dark:text-slate-300">Sunset</p>
          <p className="mt-1 font-bold text-slate-950 dark:text-white">
            {formatTime(weather.sunset)}
          </p>
        </div>
      </div>
    </section>
  );
}
