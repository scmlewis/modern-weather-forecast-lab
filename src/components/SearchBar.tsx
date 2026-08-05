import { FormEvent, useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react';
import { LocateFixed, Search } from 'lucide-react';
import type { LocationSuggestion } from '../types/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocate: () => void;
  onQueryChange: (value: string) => void;
  onSuggestionSelect: (suggestion: LocationSuggestion) => void;
  loading: boolean;
  locating: boolean;
  query: string;
  suggestions?: LocationSuggestion[];
  suggestionsLoading?: boolean;
  suggestionsError?: string | null;
}

export function SearchBar({
  onSearch,
  onLocate,
  onQueryChange,
  onSuggestionSelect,
  loading,
  locating,
  query,
  suggestions = [],
  suggestionsLoading = false,
  suggestionsError = null,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const trimmedQuery = query.trim();
  const shouldShowSuggestions = trimmedQuery.length >= 2;
  const hasSuggestions = suggestions.length > 0;

  const showEmptyState = useMemo(
    () => shouldShowSuggestions && !suggestionsLoading && !suggestionsError && !hasSuggestions,
    [hasSuggestions, shouldShowSuggestions, suggestionsError, suggestionsLoading],
  );

  const showDropdown = useMemo(
    () =>
      isOpen &&
      shouldShowSuggestions &&
      (hasSuggestions || showEmptyState || suggestionsLoading || Boolean(suggestionsError)),
    [hasSuggestions, isOpen, shouldShowSuggestions, showEmptyState, suggestionsError, suggestionsLoading],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
      setIsOpen(false);
    }
  };

  const handleChange = (value: string) => {
    onQueryChange(value);
    if (value.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onQueryChange(suggestion.label);
    onSuggestionSelect(suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || !hasSuggestions) {
      if (event.key === 'ArrowDown' && hasSuggestions) {
        setIsOpen(true);
        setActiveIndex(0);
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      setActiveIndex((current) => (current + 1) % suggestions.length);
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowUp') {
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (!hasSuggestions) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(0);
  }, [hasSuggestions]);

  return (
    <form className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3" onSubmit={handleSubmit}>
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
        <input
          className="control-glass h-12 w-full px-12 py-4 text-sm font-medium placeholder:text-slate-500 dark:placeholder:text-slate-300 sm:h-14"
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (trimmedQuery.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search city"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={showDropdown ? listId : undefined}
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          type="search"
          value={query}
        />
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/90">
            <ul className="max-h-64 overflow-y-auto py-2 text-sm" id={listId} role="listbox">
              {suggestionsLoading && (
                <li className="px-4 py-2 text-slate-600 dark:text-slate-200">Searching...</li>
              )}
              {suggestionsError && !suggestionsLoading && (
                <li className="px-4 py-2 text-rose-600 dark:text-rose-200">{suggestionsError}</li>
              )}
              {hasSuggestions &&
                suggestions.map((suggestion, index) => {
                  const secondaryLabel = suggestion.countryCode ?? suggestion.country;

                  return (
                  <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                    <button
                      className={`flex w-full items-center justify-between px-4 py-2 text-left transition ${
                        index === activeIndex
                          ? 'bg-slate-900 text-white dark:bg-white/15'
                          : 'text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10'
                      }`}
                      id={`${listId}-option-${index}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      type="button"
                    >
                      <span className="font-semibold">{suggestion.label}</span>
                      {secondaryLabel && (
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                          {secondaryLabel}
                        </span>
                      )}
                    </button>
                  </li>
                  );
                })}
              {showEmptyState && (
                <li className="px-4 py-2 text-slate-600 dark:text-slate-200">No matches found.</li>
              )}
            </ul>
          </div>
        )}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
        <button
          className="control-glass h-12 w-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 sm:h-14 sm:w-auto"
          disabled={loading || !trimmedQuery}
          type="submit"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          className="control-glass inline-flex h-12 w-full items-center justify-center gap-2 px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-auto"
          disabled={loading || locating}
          onClick={onLocate}
          type="button"
          title="Use current location"
        >
          <LocateFixed className="h-5 w-5" />
          <span>{locating ? 'Locating...' : 'Current'}</span>
        </button>
      </div>
    </form>
  );
}
