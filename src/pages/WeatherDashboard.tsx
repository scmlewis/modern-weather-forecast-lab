import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatedWeatherBackground } from '../components/AnimatedWeatherBackground';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { RecentSearches } from '../components/RecentSearches';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getWeatherByCity, getWeatherByCoords, getWeatherByLocation } from '../services/weatherService';
import type { LocationSuggestion, WeatherBundle } from '../types/weather';
import { getWeatherGradient } from '../utils/weatherTheme';

const DEFAULT_CITY = 'London';

const ForecastDetails = lazy(() =>
  import('../components/ForecastDetails').then((module) => ({
    default: module.ForecastDetails,
  })),
);

const HourlyChart = lazy(() =>
  import('../components/HourlyChart').then((module) => ({
    default: module.HourlyChart,
  })),
);

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading weather data.';
};

const getWeatherHeadline = (condition?: string) => {
  const normalized = condition?.toLowerCase() ?? '';

  if (normalized.includes('thunder')) {
    return 'Storm energy in the air.';
  }

  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return 'Rain on the way, stay cozy.';
  }

  if (normalized.includes('snow')) {
    return 'Snowfall ahead, layer up.';
  }

  if (normalized.includes('mist') || normalized.includes('fog') || normalized.includes('haze')) {
    return 'Low visibility, take it slow.';
  }

  if (normalized.includes('cloud')) {
    return 'Soft light, steady skies.';
  }

  return 'Bright skies, clear plans.';
};

const formatRecentLabel = (name: string, country?: string) => {
  if (!country || country.toLowerCase() === 'local') {
    return name;
  }

  return `${name}, ${country}`;
};

const SectionSkeleton = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <section className="glass-card min-h-72 animate-pulse p-5 sm:p-6">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <div className="h-4 w-32 rounded-full bg-white/30" />
        <div className="mt-2 h-6 w-48 rounded-full bg-white/40" />
      </div>
      <div className="h-4 w-20 rounded-full bg-white/25" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-3/4 rounded-full bg-white/25" />
      <div className="h-4 w-2/3 rounded-full bg-white/25" />
      <div className="h-4 w-4/5 rounded-full bg-white/25" />
    </div>
    <p className="mt-6 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
      {title} - {subtitle}
    </p>
  </section>
);

export function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('weather-recent-searches', []);
  const { getLocation, isLocating, geoError, clearGeoError } = useGeolocation();
  const { isDark, toggleTheme } = useDarkMode();
  const {
    suggestions,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useLocationAutocomplete(searchQuery);
  const weatherCondition = weather?.current.condition.main;

  const gradient = useMemo(
    () => getWeatherGradient(weatherCondition),
    [weatherCondition],
  );

  const headline = useMemo(
    () => getWeatherHeadline(weatherCondition),
    [weatherCondition],
  );

  const saveRecentSearch = (city: string) => {
    setRecentSearches((current) => {
      const normalized = city.trim();
      const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())];
      return next.slice(0, 6);
    });
  };

  const loadCityWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    clearGeoError();
    setSearchQuery(city);

    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
      const recentLabel = formatRecentLabel(data.current.name, data.current.country);
      saveRecentSearch(recentLabel);
      setSearchQuery(recentLabel);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  const loadLocationWeather = async (suggestion: LocationSuggestion) => {
    setLoading(true);
    setError(null);
    clearGeoError();
    setSearchQuery(suggestion.label);

    try {
      const data = await getWeatherByLocation(suggestion);
      setWeather(data);
      saveRecentSearch(suggestion.label);
      setSearchQuery(suggestion.label);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getLocation();
      const data = await getWeatherByCoords(coords);
      setWeather(data);
      const recentLabel = formatRecentLabel(data.current.name, data.current.country);
      saveRecentSearch(recentLabel);
      setSearchQuery(recentLabel);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  const hourlyOverview = useMemo(() => weather?.hourly.slice(0, 8) ?? [], [weather]);
  const weeklyOverview = useMemo(() => weather?.daily.slice(0, 7) ?? [], [weather]);
  const hourlyChart = useMemo(() => weather?.hourly.slice(0, 30) ?? [], [weather]);

  useEffect(() => {
    void loadCityWeather(recentSearches[0] ?? DEFAULT_CITY);
    // Initial load only; recentSearches is intentionally read as a starting hint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${gradient} px-4 py-5 text-slate-900 transition-colors duration-700 dark:text-white sm:px-6 lg:px-8`}>
      <AnimatedWeatherBackground condition={weather?.current.condition.main} />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75 dark:text-sky-100/70">
              Open-Meteo Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-white sm:text-5xl">
              {headline}
            </h1>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        <section className="glass-card p-4 sm:p-5">
          <SearchBar
            loading={loading}
            locating={isLocating}
            onLocate={loadCurrentLocation}
            onQueryChange={setSearchQuery}
            onSearch={loadCityWeather}
            onSuggestionSelect={loadLocationWeather}
            query={searchQuery}
            suggestions={suggestions}
            suggestionsError={suggestionsError}
            suggestionsLoading={suggestionsLoading}
          />
          <div className="mt-4">
            <RecentSearches onSelect={loadCityWeather} searches={recentSearches} />
          </div>
        </section>

        {error && <ErrorBanner message={error} />}
        {geoError && !error && !loading && <ErrorBanner message={geoError} />}

        {loading && <LoadingState />}

        {!loading && weather && (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.05fr_1.6fr]">
              <CurrentWeatherCard
                weather={weather.current}
                precipitationChance={weather.hourly[0]?.precipitationChance}
              />
              <Suspense fallback={<SectionSkeleton title="Planning View" subtitle="Loading forecast" />}>
                <ForecastDetails hourly={hourlyOverview} weekly={weeklyOverview} />
              </Suspense>
            </div>
            <Suspense fallback={<SectionSkeleton title="Hourly Temperature" subtitle="Loading chart" />}>
              <HourlyChart hourly={hourlyChart} />
            </Suspense>
          </>
        )}
      </div>
    </main>
  );
}
