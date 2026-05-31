import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/28 text-sky-700 dark:bg-white/10 dark:text-sky-200">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
            {label}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
