import { CloudRain, Droplets, Eye, MapPin, Sunrise, Sunset, Wind } from 'lucide-react';
import type { CurrentWeather } from '../types/weather';
import {
  formatSpeed,
  formatTime,
  roundTemp,
  type TemperatureUnit,
  type TimeMode,
  type WindSpeedUnit,
  titleCase,
} from '../utils/format';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  precipitationChance?: number;
  temperatureUnit?: TemperatureUnit;
  timeMode?: TimeMode;
  windSpeedUnit?: WindSpeedUnit;
}

export function CurrentWeatherCard({
  weather,
  precipitationChance,
  temperatureUnit = 'c',
  timeMode = 'location',
  windSpeedUnit = 'ms',
}: CurrentWeatherCardProps) {
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
      value: formatSpeed(weather.windSpeed, windSpeedUnit),
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
    <section className="glass-card min-h-full p-5 sm:p-8">
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

      <div className="mt-6 grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-start">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 md:block">
            <p className="text-6xl font-black leading-none text-slate-950 dark:text-white sm:text-7xl lg:text-8xl">
              {roundTemp(weather.temperature, temperatureUnit)}
            </p>
            <div
              aria-label={weather.condition.description}
              className="flex items-center justify-end text-6xl drop-shadow-lg md:hidden"
              role="img"
            >
              {weather.condition.icon}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200">
            Feels like {roundTemp(weather.feelsLike, temperatureUnit)}
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

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Core Conditions
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {details.map(({ icon: Icon, label, value }) => (
          <div
            className="min-w-0 rounded-3xl border border-white/15 bg-white/30 p-4 shadow-sm dark:border-white/10 dark:bg-white/10"
            key={label}
          >
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white/35 text-sky-700 dark:bg-white/10 dark:text-sky-200">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{label}</p>
              </div>
              <p className="text-2xl font-black leading-none text-slate-950 dark:text-white sm:text-[1.6rem]">
                {value}
              </p>
            </div>
          </div>
        ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/30 p-4 dark:bg-white/10">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Sunrise className="h-4 w-4" />
            <p>Sunrise</p>
          </div>
          <p className="mt-2 font-bold text-slate-950 dark:text-white">
            {formatTime(weather.sunrise, { timeZone: weather.timezone, mode: timeMode })}
          </p>
        </div>
        <div className="rounded-2xl bg-white/30 p-4 dark:bg-white/10">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Sunset className="h-4 w-4" />
            <p>Sunset</p>
          </div>
          <p className="mt-2 font-bold text-slate-950 dark:text-white">
            {formatTime(weather.sunset, { timeZone: weather.timezone, mode: timeMode })}
          </p>
        </div>
      </div>
    </section>
  );
}
