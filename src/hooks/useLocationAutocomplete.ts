import { useEffect, useRef, useState } from 'react';
import type { LocationSuggestion } from '../types/weather';
import { searchLocations } from '../services/weatherService';
import { getErrorMessage } from '../utils/errors';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

export const useLocationAutocomplete = (query: string) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await searchLocations(normalizedQuery, 6);
        if (isActive && !controller.signal.aborted) {
          setSuggestions(results);
        }
      } catch (caughtError) {
        if (isActive && !controller.signal.aborted) {
          setSuggestions([]);
          setError(getErrorMessage(caughtError, 'Unable to load suggestions right now.'));
        }
      } finally {
        if (isActive && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { suggestions, isLoading, error };
};
