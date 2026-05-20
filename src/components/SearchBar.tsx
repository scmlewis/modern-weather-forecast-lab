import { FormEvent, useState } from 'react';
import { LocateFixed, Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocate: () => void;
  loading: boolean;
  locating: boolean;
}

export function SearchBar({ onSearch, onLocate, loading, locating }: SearchBarProps) {
  const [city, setCity] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
        <input
          className="control-glass h-14 w-full px-12 py-4 text-sm font-medium placeholder:text-slate-500 dark:placeholder:text-slate-300"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Search city"
          type="search"
          value={city}
        />
      </label>
      <button
        className="control-glass h-14 px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading || !city.trim()}
        type="submit"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      <button
        className="control-glass inline-flex h-14 items-center justify-center gap-2 px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading || locating}
        onClick={onLocate}
        type="button"
        title="Use current location"
      >
        <LocateFixed className="h-5 w-5" />
        <span>{locating ? 'Locating...' : 'Current'}</span>
      </button>
    </form>
  );
}
