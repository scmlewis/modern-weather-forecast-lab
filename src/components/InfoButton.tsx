import { Info, X, Github, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function InfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="control-glass flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12"
        onClick={() => setIsOpen(true)}
        title="About this app"
        type="button"
      >
        <Info className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/25 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950/90"
            ref={modalRef}
            role="dialog"
            aria-label="About this app"
          >
            <button
              className="absolute right-4 top-4 rounded-full p-1 text-slate-500 transition hover:bg-black/10 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => setIsOpen(false)}
              title="Close"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Weather Dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Version 1.0.0
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                  Features
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    Real-time weather with 7-day forecast
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Air Quality Index (AQI) monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Save favorite locations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Severe weather alerts
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                  Built With
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Recharts'].map((tech) => (
                    <span
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      key={tech}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                  Data Source
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Powered by the free{' '}
                  <a
                    className="inline-flex items-center gap-1 font-medium text-sky-600 hover:underline dark:text-sky-400"
                    href="https://open-meteo.com/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Open-Meteo API
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {' '}— no API key required.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <a
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  href="https://github.com/scmlewis/modern-weather-forecast-lab"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
