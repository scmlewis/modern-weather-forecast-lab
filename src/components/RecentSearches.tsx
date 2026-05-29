import type { RecentSearchEntry } from '../types/weather';

interface RecentSearchesProps {
  searches: RecentSearchEntry[];
  onSelect: (entry: RecentSearchEntry) => void;
  onClear?: () => void;
}

export function RecentSearches({ searches, onSelect, onClear }: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 dark:text-slate-300">
          Recent Searches
        </p>
        {onClear && (
          <button
            className="text-xs font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            onClick={onClear}
            type="button"
          >
            Clear history
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((entry) => (
          <button
            className="rounded-full border border-white/25 bg-white/30 px-3 py-2 text-xs font-semibold text-slate-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/45 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            key={entry.id}
            onClick={() => onSelect(entry)}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  );
}
