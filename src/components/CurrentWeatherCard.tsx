import { CloudRain, Droplets, Eye, MapPin, Sunrise, Sunset, Wind } from 'lucide-react';
import type { CurrentWeather } from '../types/weather';
import { formatSpeed, formatTime, roundTemp, titleCase } from '../utils/format';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  precipitationChance?: number;
}

export function CurrentWeatherCard({ weather, precipitationChance }: CurrentWeatherCardProps) {
  const precipitationValue = precipitationChance == null ? 'n/a' : `${precipitationChance}%`;
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
    {
      icon: CloudRain,
      label: 'Precip',
      value: precipitationValue,
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
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-start">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 md:block">
            <p className="text-7xl font-black leading-none text-slate-950 dark:text-white sm:text-8xl">
              {roundTemp(weather.temperature)}
            </p>
            <div
              aria-label={weather.condition.description}
              className="flex items-center justify-end text-6xl drop-shadow-lg md:hidden"
              role="img"
            >
              {weather.condition.icon}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
            Feels like {roundTemp(weather.feelsLike)}
          </p>
        </div>
        <div
          aria-label={weather.condition.description}
          className="hidden items-center justify-end text-7xl drop-shadow-lg md:flex"
          role="img"
        >
          {weather.condition.icon}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {details.map(({ icon: Icon, label, value }) => (
          <div className="rounded-2xl bg-white/25 p-3 dark:bg-white/10" key={label}>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Icon className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
            </div>
            <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/30 p-4 dark:bg-white/10">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Sunrise className="h-4 w-4" />
            <p>Sunrise</p>
          </div>
          <p className="mt-2 font-bold text-slate-950 dark:text-white">
            {formatTime(weather.sunrise)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/30 p-4 dark:bg-white/10">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Sunset className="h-4 w-4" />
            <p>Sunset</p>
          </div>
          <p className="mt-2 font-bold text-slate-950 dark:text-white">
            {formatTime(weather.sunset)}
          </p>
        </div>
      </div>
    </section>
  );
}
