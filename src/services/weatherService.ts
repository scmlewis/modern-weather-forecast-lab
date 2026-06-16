import axios from 'axios';
import type {
  Coordinates,
  CurrentWeather,
  DailyForecast,
  ForecastPoint,
  LocationSuggestion,
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
  OpenMeteoLocation,
  WeatherBundle,
  WeatherCondition,
} from '../types/weather';

const forecastApi = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 12000,
});

const geocodingApi = axios.create({
  baseURL: 'https://geocoding-api.open-meteo.com/v1',
  timeout: 12000,
});

const CACHE_PREFIX = 'weather-cache-v2';
const WEATHER_TTL_MS = 30 * 60 * 1000;
const GEOCODE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_SEARCH_LENGTH = 2;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

const getCacheKey = (key: string) => `${CACHE_PREFIX}:${key}`;

const readCache = <T,>(key: string): T | null => {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key);

  if (memoryEntry) {
    if (memoryEntry.expiresAt > now) {
      return memoryEntry.value as T;
    }

    memoryCache.delete(key);
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(getCacheKey(key));
  if (!stored) {
    return null;
  }

  try {
    const entry = JSON.parse(stored) as CacheEntry<T>;
    if (entry.expiresAt > now) {
      memoryCache.set(key, entry);
      return entry.value;
    }
  } catch {
    return null;
  }

  return null;
};

const writeCache = <T,>(key: string, value: T, ttlMs: number) => {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  memoryCache.set(key, entry);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  }
};

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const formatLocationLabel = (location: OpenMeteoLocation) => {
  const parts = [location.name, location.admin1, location.country_code ?? location.country].filter(Boolean);
  return parts.join(', ');
};

const weatherCodeMap: Record<number, WeatherCondition> = {
  0: { code: 0, main: 'Clear', description: 'clear sky', icon: '☀️' },
  1: { code: 1, main: 'Clear', description: 'mainly clear', icon: '🌤️' },
  2: { code: 2, main: 'Clouds', description: 'partly cloudy', icon: '⛅' },
  3: { code: 3, main: 'Clouds', description: 'overcast', icon: '☁️' },
  45: { code: 45, main: 'Fog', description: 'fog', icon: '🌫️' },
  48: { code: 48, main: 'Fog', description: 'depositing rime fog', icon: '🌫️' },
  51: { code: 51, main: 'Drizzle', description: 'light drizzle', icon: '🌦️' },
  53: { code: 53, main: 'Drizzle', description: 'moderate drizzle', icon: '🌦️' },
  55: { code: 55, main: 'Drizzle', description: 'dense drizzle', icon: '🌧️' },
  61: { code: 61, main: 'Rain', description: 'slight rain', icon: '🌧️' },
  63: { code: 63, main: 'Rain', description: 'moderate rain', icon: '🌧️' },
  65: { code: 65, main: 'Rain', description: 'heavy rain', icon: '🌧️' },
  71: { code: 71, main: 'Snow', description: 'slight snow', icon: '🌨️' },
  73: { code: 73, main: 'Snow', description: 'moderate snow', icon: '🌨️' },
  75: { code: 75, main: 'Snow', description: 'heavy snow', icon: '❄️' },
  80: { code: 80, main: 'Rain', description: 'slight rain showers', icon: '🌦️' },
  81: { code: 81, main: 'Rain', description: 'moderate rain showers', icon: '🌧️' },
  82: { code: 82, main: 'Rain', description: 'violent rain showers', icon: '⛈️' },
  95: { code: 95, main: 'Thunderstorm', description: 'thunderstorm', icon: '⛈️' },
  96: { code: 96, main: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '⛈️' },
  99: { code: 99, main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '⛈️' },
};

export const getWeatherCondition = (code: number): WeatherCondition =>
  weatherCodeMap[code] ?? {
    code,
    main: 'Unknown',
    description: 'weather conditions unavailable',
    icon: '🌡️',
  };

const forecastParams = ({ lat, lon }: Coordinates) => ({
  latitude: lat,
  longitude: lon,
  timezone: 'auto',
  forecast_days: 7,
  wind_speed_unit: 'ms',
  current: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
    'uv_index',
  ].join(','),
  hourly: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
    'precipitation_probability',
    'surface_pressure',
    'visibility',
    'cloud_cover',
    'wind_gusts_10m',
    'precipitation',
  ].join(','),
  daily: [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'wind_speed_10m_max',
    'sunrise',
    'sunset',
  ].join(','),
});

const normalizeLocationLabel = (location?: OpenMeteoLocation) => ({
  name: location?.name ?? 'Current Location',
  country: location?.country_code ?? location?.country ?? 'Local',
  timezone: location?.timezone,
});

const normalizeForecast = (
  data: OpenMeteoForecastResponse,
  location?: OpenMeteoLocation,
): WeatherBundle => {
  const label = normalizeLocationLabel(location);
  const resolveNearestIndex = (times: string[], target: string) => {
    if (times.length === 0) {
      return 0;
    }

    const exactIndex = times.indexOf(target);
    if (exactIndex >= 0) {
      return exactIndex;
    }

    const targetMillis = Date.parse(target);
    if (Number.isNaN(targetMillis)) {
      return 0;
    }

    let closestIndex = 0;
    let closestDiff = Number.POSITIVE_INFINITY;

    times.forEach((time, index) => {
      const timeMillis = Date.parse(time);
      if (Number.isNaN(timeMillis)) {
        return;
      }

      const diff = Math.abs(timeMillis - targetMillis);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const resolvedIndex = resolveNearestIndex(data.hourly.time, data.current.time);
  const fallbackIndex = data.hourly.time.length > 0 ? 0 : resolvedIndex;
  const resolveHourlyValue = <T,>(values: T[] | undefined | null) =>
    values?.[resolvedIndex] ?? values?.[fallbackIndex] ?? null;
  const visibilityMeters = resolveHourlyValue(data.hourly.visibility);
  const hourly: ForecastPoint[] = data.hourly.time.map((time, index) => ({
    time,
    temperature: data.hourly.temperature_2m[index],
    feelsLike: data.hourly.apparent_temperature[index],
    humidity: data.hourly.relative_humidity_2m[index],
    windSpeed: data.hourly.wind_speed_10m[index],
    condition: getWeatherCondition(data.hourly.weather_code[index]),
    precipitationChance: data.hourly.precipitation_probability[index] ?? 0,
  }));

  const daily: DailyForecast[] = data.daily.time.map((date, index) => ({
    date,
    min: data.daily.temperature_2m_min[index],
    max: data.daily.temperature_2m_max[index],
    condition: getWeatherCondition(data.daily.weather_code[index]),
    precipitationSum: data.daily.precipitation_sum[index] ?? 0,
    maxWindSpeed: data.daily.wind_speed_10m_max[index] ?? 0,
    sunrise: data.daily.sunrise[index],
    sunset: data.daily.sunset[index],
  }));

  const current: CurrentWeather = {
    name: label.name,
    country: label.country,
    coordinates: {
      lat: data.latitude,
      lon: data.longitude,
    },
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: resolveHourlyValue(data.hourly.wind_gusts_10m),
    windDirection: data.current.wind_direction_10m,
    pressure: resolveHourlyValue(data.hourly.surface_pressure),
    visibilityKm: visibilityMeters == null ? null : Math.max(0, visibilityMeters / 1000),
    cloudCover: resolveHourlyValue(data.hourly.cloud_cover),
    precipitationRate: resolveHourlyValue(data.hourly.precipitation),
    uvIndex: data.current.uv_index ?? null,
    condition: getWeatherCondition(data.current.weather_code),
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
    timezone: label.timezone ?? data.timezone,
  };

  return { current, hourly, daily, currentHourlyIndex: resolvedIndex };
};

const getForecastByLocation = async (location: OpenMeteoLocation): Promise<WeatherBundle> => {
  const cacheKey = `weather:${location.latitude.toFixed(3)}:${location.longitude.toFixed(3)}`;
  const cached = readCache<WeatherBundle>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await forecastApi.get<OpenMeteoForecastResponse>('/forecast', {
    params: forecastParams({
      lat: location.latitude,
      lon: location.longitude,
    }),
  });

  const normalized = normalizeForecast(response.data, location);
  writeCache(cacheKey, normalized, WEATHER_TTL_MS);
  return normalized;
};

export const searchLocations = async (query: string, count = 6): Promise<LocationSuggestion[]> => {
  const normalizedQuery = normalizeQuery(query);

  if (normalizedQuery.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  const cacheKey = `geocode:${normalizedQuery}:${count}:en`;
  const cached = readCache<LocationSuggestion[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await geocodingApi.get<OpenMeteoGeocodingResponse>('/search', {
    params: {
      name: query.trim(),
      count,
      language: 'en',
      format: 'json',
    },
  });

  const suggestions = (response.data.results ?? []).map((location) => ({
    id: location.id,
    name: location.name,
    admin1: location.admin1,
    country: location.country ?? location.country_code,
    countryCode: location.country_code,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
    label: formatLocationLabel(location),
  }));

  writeCache(cacheKey, suggestions, GEOCODE_TTL_MS);
  return suggestions;
};

export const getWeatherByLocation = async (suggestion: LocationSuggestion): Promise<WeatherBundle> => {
  const location: OpenMeteoLocation = {
    id: suggestion.id,
    name: suggestion.name,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    country: suggestion.country,
    country_code: suggestion.countryCode,
    timezone: suggestion.timezone,
    admin1: suggestion.admin1,
  };

  return getForecastByLocation(location);
};

export const getWeatherByCoords = async ({ lat, lon }: Coordinates): Promise<WeatherBundle> => {
  const cacheKey = `weather:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = readCache<WeatherBundle>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await forecastApi.get<OpenMeteoForecastResponse>('/forecast', {
    params: forecastParams({ lat, lon }),
  });

  const normalized = normalizeForecast(response.data);
  writeCache(cacheKey, normalized, WEATHER_TTL_MS);
  return normalized;
};
