import axios from 'axios';
import type { Coordinates } from '../types/weather';
import type { AirQualityData, AirQualityResponse } from '../types/airQuality';
import { getAqiLevel } from '../types/airQuality';

const airQualityApi = axios.create({
  baseURL: 'https://air-quality-api.open-meteo.com/v1',
  timeout: 12000,
});

const CACHE_PREFIX = 'air-quality-cache';
const AQI_TTL_MS = 30 * 60 * 1000;

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

const normalizeAirQuality = (data: AirQualityResponse): AirQualityData => ({
  usAqi: data.current.us_aqi,
  pm25: data.current.pm2_5,
  pm10: data.current.pm10,
  ozone: data.current.ozone,
  level: getAqiLevel(data.current.us_aqi),
});

export const getAirQuality = async ({ lat, lon }: Coordinates): Promise<AirQualityData> => {
  const cacheKey = `aqi:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = readCache<AirQualityData>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await airQualityApi.get<AirQualityResponse>('/air-quality', {
    params: {
      latitude: lat,
      longitude: lon,
      current: ['us_aqi', 'pm2_5', 'pm10', 'ozone'].join(','),
    },
  });

  const normalized = normalizeAirQuality(response.data);
  writeCache(cacheKey, normalized, AQI_TTL_MS);
  return normalized;
};
