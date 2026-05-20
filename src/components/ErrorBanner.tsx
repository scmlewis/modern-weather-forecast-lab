import { AlertTriangle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 text-rose-900 shadow-sm backdrop-blur dark:border-rose-400/20 dark:bg-rose-950/45 dark:text-rose-100">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
