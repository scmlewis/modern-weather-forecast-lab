import { Wind } from 'lucide-react';
import type { AirQualityData } from '../types/airQuality';
import { AQI_LEVELS } from '../types/airQuality';

interface AirQualityCardProps {
  data: AirQualityData | null;
  loading?: boolean;
}

const formatPollutant = (value: number | null, unit: string): string => {
  if (value == null) return 'n/a';
  return `${value.toFixed(1)} ${unit}`;
};

export function AirQualityCard({ data, loading }: AirQualityCardProps) {
  if (loading) {
    return (
      <section className="glass-card min-h-48 animate-pulse p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-4 w-32 rounded-full bg-white/30" />
            <div className="mt-2 h-6 w-48 rounded-full bg-white/40" />
          </div>
          <div className="h-4 w-20 rounded-full bg-white/25" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded-full bg-white/25" />
          <div className="h-4 w-2/3 rounded-full bg-white/25" />
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const levelInfo = AQI_LEVELS[data.level];

  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Air Quality
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            Health Impact
          </h2>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-bold text-white ${levelInfo.bgClass}`}>
          {levelInfo.label}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-6">
        <div className="flex-1">
          <p className="text-6xl font-black leading-none text-slate-950 dark:text-white sm:text-7xl">
            {data.usAqi}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            US AQI
          </p>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Wind className="h-4 w-4 text-sky-600 dark:text-sky-300" />
            <span className="font-medium">PM2.5:</span>
            <span>{formatPollutant(data.pm25, 'μg/m³')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Wind className="h-4 w-4 text-sky-600 dark:text-sky-300" />
            <span className="font-medium">PM10:</span>
            <span>{formatPollutant(data.pm10, 'μg/m³')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Wind className="h-4 w-4 text-sky-600 dark:text-sky-300" />
            <span className="font-medium">Ozone:</span>
            <span>{formatPollutant(data.ozone, 'μg/m³')}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {data.level === 'good' && 'Air quality is satisfactory. Enjoy outdoor activities.'}
        {data.level === 'moderate' && 'Unusually sensitive people should consider limiting prolonged outdoor exertion.'}
        {data.level === 'unhealthy-sensitive' && 'Sensitive groups may experience health effects. Limit outdoor exertion.'}
        {data.level === 'unhealthy' && 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.'}
        {data.level === 'very-unhealthy' && 'Health alert: everyone may experience serious health effects.'}
        {data.level === 'hazardous' && 'Health emergency: avoid all outdoor exertion.'}
      </p>
    </section>
  );
}
