interface RecentSearchesProps {
  searches: string[];
  onSelect: (city: string) => void;
}

export function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {searches.map((city) => (
        <button
          className="rounded-full border border-white/25 bg-white/30 px-3 py-2 text-xs font-semibold text-slate-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/45 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          key={city}
          onClick={() => onSelect(city)}
          type="button"
        >
          {city}
        </button>
      ))}
    </div>
  );
}
