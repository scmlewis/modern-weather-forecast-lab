import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import type { ForecastPoint } from '../types/weather';
import { convertTemp, formatHour, type TemperatureUnit, type TimeMode } from '../utils/format';

interface HourlyChartProps {
  hourly: ForecastPoint[];
  temperatureUnit?: TemperatureUnit;
  timeMode?: TimeMode;
  timezone?: string;
}

export function HourlyChart({
  hourly,
  temperatureUnit = 'c',
  timeMode = 'location',
  timezone,
}: HourlyChartProps) {
  const hoursToShow = hourly.length;
  const chartData = useMemo(
    () =>
      hourly.map((point) => ({
        time: formatHour(point.time, { timeZone: timezone, mode: timeMode }),
        temp: Math.round(convertTemp(point.temperature, temperatureUnit)),
        feels: Math.round(convertTemp(point.feelsLike, temperatureUnit)),
      })),
    [hourly, temperatureUnit, timeMode, timezone],
  );

  return (
    <section className="glass-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Hourly Temperature</h2>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Next {hoursToShow} hrs
        </span>
      </div>
      <div className="h-60 w-full text-slate-700 dark:text-slate-300 sm:h-72">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
            <defs>
              <linearGradient id="temperatureGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.35)" strokeDasharray="4 4" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={false}
              unit={`°${temperatureUnit.toUpperCase()}`}
            />
            <Tooltip
              contentStyle={{
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 16,
                background: 'rgba(15, 23, 42, 0.72)',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
                color: '#fff',
              }}
              formatter={(value: number, name: string) => [`${value}\u00b0${temperatureUnit.toUpperCase()}`, name]}
            />
            <Area
              dataKey="temp"
              fill="url(#temperatureGradient)"
              name="Temperature"
              stroke="#0284c7"
              strokeWidth={3}
              type="monotone"
            />
            <Area
              dataKey="feels"
              fill="transparent"
              name="Feels Like"
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
