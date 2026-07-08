// src/types/airQuality.ts

export interface AirQualityData {
  usAqi: number;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  level: AqiLevel;
}

export type AqiLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    us_aqi: number;
    pm2_5: number;
    pm10: number;
    ozone: number;
  };
}

export const AQI_LEVELS: Record<AqiLevel, { label: string; color: string; bgClass: string; textClass: string }> = {
  good: {
    label: 'Good',
    color: '#22c55e',
    bgClass: 'bg-green-500',
    textClass: 'text-green-700 dark:text-green-300'
  },
  moderate: {
    label: 'Moderate',
    color: '#eab308',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-700 dark:text-yellow-300'
  },
  'unhealthy-sensitive': {
    label: 'Unhealthy for Sensitive Groups',
    color: '#f97316',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-700 dark:text-orange-300'
  },
  unhealthy: {
    label: 'Unhealthy',
    color: '#ef4444',
    bgClass: 'bg-red-500',
    textClass: 'text-red-700 dark:text-red-300'
  },
  'very-unhealthy': {
    label: 'Very Unhealthy',
    color: '#a855f7',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-700 dark:text-purple-300'
  },
  hazardous: {
    label: 'Hazardous',
    color: '#881337',
    bgClass: 'bg-rose-900',
    textClass: 'text-rose-300 dark:text-rose-200'
  },
};

export const getAqiLevel = (aqi: number): AqiLevel => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};
