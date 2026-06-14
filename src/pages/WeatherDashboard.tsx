import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cloud, CloudRain, Eye, Gauge, Settings2, Wind } from 'lucide-react';
import { AnimatedWeatherBackground } from '../components/AnimatedWeatherBackground';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { MetricCard } from '../components/MetricCard';
import { RecentSearches } from '../components/RecentSearches';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getWeatherByCoords, getWeatherByLocation, searchLocations } from '../services/weatherService';
import type { LocationSuggestion, RecentSearchEntry, WeatherBundle } from '../types/weather';
import { getWeatherGradient } from '../utils/weatherTheme';
import { getErrorMessage } from '../utils/errors';
import { formatSpeed, type TemperatureUnit, type TimeMode } from '../utils/format';

const DEFAULT_CITY = 'London';
const MAX_RECENT_SEARCHES = 6;

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

const createCityEntry = (city: string): RecentSearchEntry => {
  const normalized = city.trim();
  const baseName = normalized.split(',')[0]?.trim().toLowerCase();

  return {
    id: `city:${normalized.toLowerCase()}`,
    label: normalized,
    kind: 'city',
    dedupeKey: baseName || normalized.toLowerCase(),
    query: normalized,
  };
};

const createLocationEntry = (suggestion: LocationSuggestion): RecentSearchEntry => ({
  id: `location:${suggestion.id}`,
  label: suggestion.label,
  kind: 'location',
  dedupeKey: suggestion.name.trim().toLowerCase(),
  location: suggestion,
});

const createCoordsEntry = (coords: { lat: number; lon: number }, label: string): RecentSearchEntry => {
  const key = `coords:${coords.lat.toFixed(3)}:${coords.lon.toFixed(3)}`;

  return {
    id: key,
    label,
    kind: 'coords',
    dedupeKey: key,
    coords,
  };
};

const normalizeRecentSearches = (
  entries: Array<RecentSearchEntry | string>,
): { normalized: RecentSearchEntry[]; hadLegacy: boolean } => {
  let hadLegacy = false;

  const normalized = entries
    .map((entry) => {
      if (typeof entry === 'string') {
        hadLegacy = true;
        return createCityEntry(entry);
      }

      if (!entry || typeof entry !== 'object') {
        hadLegacy = true;
        return null;
      }

      if (!entry.id) {
        hadLegacy = true;
        return {
          ...entry,
          id: `${entry.kind}:${entry.label.toLowerCase()}`,
        };
      }

      if (!entry.dedupeKey) {
        const baseName = entry.label.split(',')[0]?.trim().toLowerCase();
        return {
          ...entry,
          dedupeKey: entry.kind === 'coords'
            ? entry.id
            : baseName || entry.label.toLowerCase(),
        };
      }

      return entry;
    })
    .filter((entry): entry is RecentSearchEntry => Boolean(entry));

  const deduped: RecentSearchEntry[] = [];
  const seen = new Set<string>();

  normalized.forEach((entry) => {
    const key = entry.dedupeKey || entry.id || entry.label.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    deduped.push(entry);
  });

  return { normalized: deduped, hadLegacy };
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useLocalStorage<TemperatureUnit>(
    'weather-temperature-unit',
    'c',
  );
  const [timeMode, setTimeMode] = useLocalStorage<TimeMode>('weather-time-mode', 'location');
  const [storedRecentSearches, setStoredRecentSearches] = useLocalStorage<
    RecentSearchEntry[] | string[]
  >('weather-recent-searches', []);
  const { getLocation, isLocating, geoError, clearGeoError } = useGeolocation();
  const { isDark, toggleTheme } = useDarkMode();
  const {
    suggestions,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useLocationAutocomplete(searchQuery);
  const weatherCondition = weather?.current.condition.main;
  const settingsRef = useRef<HTMLDivElement>(null);
  const { normalized: recentSearches, hadLegacy } = useMemo(
    () => normalizeRecentSearches(storedRecentSearches as Array<RecentSearchEntry | string>),
    [storedRecentSearches],
  );

  const gradient = useMemo(
    () => getWeatherGradient(weatherCondition),
    [weatherCondition],
  );

  const headline = useMemo(
    () => getWeatherHeadline(weatherCondition),
    [weatherCondition],
  );

  useEffect(() => {
    if (hadLegacy) {
      setStoredRecentSearches(recentSearches);
    }
  }, [hadLegacy, recentSearches, setStoredRecentSearches]);

  const saveRecentSearch = useCallback(
    (entry: RecentSearchEntry) => {
      setStoredRecentSearches(() => {
        const trimmedLabel = entry.label.trim();
        const sanitizedEntry = { ...entry, label: trimmedLabel };
        const normalizedLabel = trimmedLabel.toLowerCase();
        const next = [
          sanitizedEntry,
          ...recentSearches.filter(
            (item) => {
              const itemLabel = item.label.trim().toLowerCase();
              const entryKey = sanitizedEntry.dedupeKey || sanitizedEntry.id || normalizedLabel;
              const itemKey = item.dedupeKey || item.id || itemLabel;

              return itemKey !== entryKey && itemLabel !== normalizedLabel;
            },
          ),
        ];

        return next.slice(0, MAX_RECENT_SEARCHES);
      });
    },
    [recentSearches, setStoredRecentSearches],
  );

  const loadCoordsWeather = useCallback(async (coords: { lat: number; lon: number }, label: string) => {
    setLoading(true);
    setError(null);
    clearGeoError();
    setSearchQuery(label);

    try {
      const data = await getWeatherByCoords(coords);
      setWeather(data);
      saveRecentSearch(createCoordsEntry(coords, label));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [clearGeoError, saveRecentSearch]);

  const loadCityWeather = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    clearGeoError();
    setSearchQuery(city);

    try {
      const [suggestion] = await searchLocations(city, 1);

      if (!suggestion) {
        setError(`No weather location found for "${city}". Try a nearby city or a more specific search.`);
        setLoading(false);
        return;
      }

      const data = await getWeatherByLocation(suggestion);
      setWeather(data);
      const entry = createLocationEntry(suggestion);
      saveRecentSearch(entry);
      setSearchQuery(entry.label);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [clearGeoError, saveRecentSearch]);

  const loadLocationWeather = useCallback(async (suggestion: LocationSuggestion) => {
    setLoading(true);
    setError(null);
    clearGeoError();
    setSearchQuery(suggestion.label);

    try {
      const data = await getWeatherByLocation(suggestion);
      setWeather(data);
      const entry = createLocationEntry(suggestion);
      saveRecentSearch(entry);
      setSearchQuery(entry.label);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [clearGeoError, saveRecentSearch]);

  const loadCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getLocation();
      const data = await getWeatherByCoords(coords);
      setWeather(data);
      const recentLabel = formatRecentLabel(data.current.name, data.current.country);
      saveRecentSearch(createCoordsEntry(coords, recentLabel));
      setSearchQuery(recentLabel);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearchSelect = useCallback(
    (entry: RecentSearchEntry) => {
      if (entry.kind === 'coords' && entry.coords) {
        void loadCoordsWeather(entry.coords, entry.label);
        return;
      }

      if (entry.kind === 'location' && entry.location) {
        void loadLocationWeather(entry.location);
        return;
      }

      const query = entry.query ?? entry.label;
      if (query) {
        void loadCityWeather(query);
      }
    },
    [loadCoordsWeather, loadLocationWeather, loadCityWeather],
  );

  const currentHourlyIndex = weather?.currentHourlyIndex ?? 0;
  const hourlyOverview = useMemo(
    () => weather?.hourly.slice(currentHourlyIndex, currentHourlyIndex + 8) ?? [],
    [currentHourlyIndex, weather],
  );
  const weeklyOverview = useMemo(() => weather?.daily.slice(0, 7) ?? [], [weather]);
  const hourlyChart = useMemo(
    () => weather?.hourly.slice(currentHourlyIndex, currentHourlyIndex + 30) ?? [],
    [currentHourlyIndex, weather],
  );
  const extraMetrics = useMemo(() => {
    if (!weather) {
      return [];
    }

    const formatValue = (value: number | null | undefined, formatter: (value: number) => string) =>
      value == null || Number.isNaN(value) ? 'n/a' : formatter(value);

    return [
      {
        icon: Gauge,
        label: 'Pressure',
        value: formatValue(weather.current.pressure, (value) => `${Math.round(value)} hPa`),
      },
      {
        icon: Eye,
        label: 'Visibility',
        value: formatValue(weather.current.visibilityKm, (value) => `${value.toFixed(1)} km`),
      },
      {
        icon: Cloud,
        label: 'Cloud cover',
        value: formatValue(weather.current.cloudCover, (value) => `${Math.round(value)}%`),
      },
      {
        icon: Wind,
        label: 'Wind gusts',
        value: formatValue(weather.current.windGust, (value) => formatSpeed(value)),
      },
      {
        icon: CloudRain,
        label: 'Rain rate',
        value: formatValue(weather.current.precipitationRate, (value) => `${value.toFixed(1)} mm/h`),
      },
    ];
  }, [weather]);

  useEffect(() => {
    if (recentSearches.length > 0) {
      handleRecentSearchSelect(recentSearches[0]);
    } else {
      void loadCityWeather(DEFAULT_CITY);
    }
    // Initial load only; recentSearches is intentionally read as a starting hint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  return (
    <main className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${gradient} px-4 py-4 text-slate-900 transition-colors duration-700 dark:text-white sm:px-6 sm:py-5 lg:px-8`}>
      <AnimatedWeatherBackground condition={weather?.current.condition.main} />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 sm:gap-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75 dark:text-sky-100/70">
              Open-Meteo Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
              {headline}
            </h1>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              aria-expanded={isSettingsOpen}
              aria-haspopup="dialog"
              className="control-glass flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12"
              onClick={() => setIsSettingsOpen((current) => !current)}
              title="Settings"
              type="button"
            >
              <Settings2 className="h-5 w-5" />
            </button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            {isSettingsOpen && (
              <div
                aria-label="Settings"
                className="absolute right-0 top-full z-20 mt-3 w-64 rounded-2xl border border-white/25 bg-white/85 p-4 text-slate-900 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/85 dark:text-white"
                ref={settingsRef}
                role="dialog"
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                      Time Mode
                    </p>
                    <div className="mt-2 inline-flex w-full rounded-full bg-white/40 p-1 dark:bg-white/10">
                      {(['location', 'device'] as const).map((option) => (
                        <button
                          className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition ${
                            timeMode === option
                              ? 'bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950'
                              : 'text-slate-700 hover:bg-white/40 dark:text-slate-300 dark:hover:bg-white/10'
                          }`}
                          key={option}
                          onClick={() => setTimeMode(option)}
                          type="button"
                        >
                          {option === 'location' ? 'Location' : 'Device'}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {timeMode === 'location'
                        ? 'Times follow the forecast location.'
                        : 'Times follow your device clock.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                      Temperature
                    </p>
                    <div className="mt-2 inline-flex w-full rounded-full bg-white/40 p-1 dark:bg-white/10">
                      {(['c', 'f'] as const).map((option) => (
                        <button
                          className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition ${
                            temperatureUnit === option
                              ? 'bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950'
                              : 'text-slate-700 hover:bg-white/40 dark:text-slate-300 dark:hover:bg-white/10'
                          }`}
                          key={option}
                          onClick={() => setTemperatureUnit(option)}
                          type="button"
                        >
                          {option === 'c' ? '\u00b0C' : '\u00b0F'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="glass-card p-3 sm:p-5">
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
          <div className="mt-3 sm:mt-4">
            <RecentSearches
              onClear={() => setStoredRecentSearches([])}
              onSelect={handleRecentSearchSelect}
              searches={recentSearches}
            />
          </div>
        </section>

        {error && <ErrorBanner message={error} />}
        {geoError && !error && !loading && <ErrorBanner message={geoError} />}

        {loading && <LoadingState />}

        {!loading && weather && (
          <>
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.05fr_1.6fr]">
              <CurrentWeatherCard
                weather={weather.current}
                precipitationChance={weather.hourly[currentHourlyIndex]?.precipitationChance}
                temperatureUnit={temperatureUnit}
                timeMode={timeMode}
              />
              <Suspense fallback={<SectionSkeleton title="Planning View" subtitle="Loading forecast" />}>
                <ForecastDetails
                  hourly={hourlyOverview}
                  weekly={weeklyOverview}
                  timezone={weather.current.timezone}
                  temperatureUnit={temperatureUnit}
                  timeMode={timeMode}
                />
              </Suspense>
            </div>
            <section className="glass-card p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    Extra Conditions
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    Metrics Snapshot
                  </h2>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Now
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {extraMetrics.map((metric) => (
                  <MetricCard
                    icon={metric.icon}
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            </section>
            <Suspense fallback={<SectionSkeleton title="Hourly Temperature" subtitle="Loading chart" />}>
              <HourlyChart
                hourly={hourlyChart}
                temperatureUnit={temperatureUnit}
                timeMode={timeMode}
                timezone={weather.current.timezone}
              />
            </Suspense>
          </>
        )}
      </div>
    </main>
  );
}
