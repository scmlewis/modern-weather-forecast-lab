import { useEffect, useState } from 'react';
import type { LocationSuggestion } from '../types/weather';
import { searchLocations } from '../services/weatherService';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load suggestions right now.';
};

export const useLocationAutocomplete = (query: string) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const results = await searchLocations(normalizedQuery, 6);
        if (isActive) {
          setSuggestions(results);
        }
      } catch (caughtError) {
        if (isActive) {
          setSuggestions([]);
          setError(getErrorMessage(caughtError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return { suggestions, isLoading, error };
};
