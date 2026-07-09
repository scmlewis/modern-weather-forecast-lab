import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import type { Alert, AlertSeverity } from '../utils/alerts';

interface AlertBannerProps {
  alerts: Alert[];
}

const severityStyles: Record<AlertSeverity, string> = {
  medium: 'bg-amber-500/90 dark:bg-amber-600/90',
  high: 'bg-red-500/90 dark:bg-red-600/90',
};

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white shadow-lg ${severityStyles[alert.severity]}`}
          key={alert.id}
          role="alert"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">{alert.type}</p>
              <p className="text-xs opacity-90">{alert.message}</p>
            </div>
          </div>
          <button
            className="rounded-full p-1 transition hover:bg-white/20"
            onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
            title="Dismiss alert"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
