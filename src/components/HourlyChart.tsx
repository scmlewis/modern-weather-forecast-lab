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
import { formatHour } from '../utils/format';

interface HourlyChartProps {
  hourly: ForecastPoint[];
}

export function HourlyChart({ hourly }: HourlyChartProps) {
  const hoursToShow = hourly.length;
  const chartData = useMemo(
    () =>
      hourly.map((point) => ({
        time: formatHour(point.time),
        temp: Math.round(point.temperature),
        feels: Math.round(point.feelsLike),
      })),
    [hourly],
  );

  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Hourly Temperature</h2>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Next {hoursToShow} hrs
        </span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
            <defs>
              <linearGradient id="temperatureGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" strokeDasharray="4 4" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={false}
              interval={2}
            />
            <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} unit="°" />
            <Tooltip
              contentStyle={{
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 16,
                background: 'rgba(15, 23, 42, 0.86)',
                color: '#fff',
              }}
              formatter={(value: number, name: string) => [`${value}\u00b0C`, name]}
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
