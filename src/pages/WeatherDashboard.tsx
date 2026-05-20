import { useEffect, useMemo, useState } from 'react';
import { Droplets, ThermometerSun, Wind } from 'lucide-react';
import { AnimatedWeatherBackground } from '../components/AnimatedWeatherBackground';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { ForecastDetails } from '../components/ForecastDetails';
import { HourlyChart } from '../components/HourlyChart';
import { LoadingState } from '../components/LoadingState';
import { MetricCard } from '../components/MetricCard';
import { RecentSearches } from '../components/RecentSearches';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getWeatherByCity, getWeatherByCoords } from '../services/weatherService';
import type { WeatherBundle } from '../types/weather';
import { formatSpeed, roundTemp } from '../utils/format';
import { getWeatherGradient } from '../utils/weatherTheme';

const DEFAULT_CITY = 'London';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading weather data.';
};

export function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('weather-recent-searches', []);
  const { getLocation, isLocating, geoError, clearGeoError } = useGeolocation();
  const { isDark, toggleTheme } = useDarkMode();
  const weatherCondition = weather?.current.condition.main;

  const gradient = useMemo(
    () => getWeatherGradient(weatherCondition),
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

    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
      saveRecentSearch(data.current.name);
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
      saveRecentSearch(data.current.name);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

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
              Weather, clearly.
            </h1>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        <section className="glass-card p-4 sm:p-5">
          <SearchBar
            loading={loading}
            locating={isLocating}
            onLocate={loadCurrentLocation}
            onSearch={loadCityWeather}
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
              <CurrentWeatherCard weather={weather.current} />
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard
                    icon={Droplets}
                    label="Humidity"
                    value={`${weather.current.humidity}%`}
                  />
                  <MetricCard
                    icon={Wind}
                    label="Wind Speed"
                    value={formatSpeed(weather.current.windSpeed)}
                  />
                  <MetricCard
                    icon={ThermometerSun}
                    label="Feels Like"
                    value={roundTemp(weather.current.feelsLike)}
                  />
                </div>
                <ForecastDetails hourly={weather.hourly} weekly={weather.daily} />
              </div>
            </div>

            <HourlyChart hourly={weather.hourly} />
          </>
        )}
      </div>
    </main>
  );
}
