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

export const AQI_LEVELS: Record<AqiLevel, { label: string; bgClass: string }> = {
  good: {
    label: 'Good',
    bgClass: 'bg-green-500',
  },
  moderate: {
    label: 'Moderate',
    bgClass: 'bg-yellow-500',
  },
  'unhealthy-sensitive': {
    label: 'Unhealthy for Sensitive Groups',
    bgClass: 'bg-orange-500',
  },
  unhealthy: {
    label: 'Unhealthy',
    bgClass: 'bg-red-500',
  },
  'very-unhealthy': {
    label: 'Very Unhealthy',
    bgClass: 'bg-purple-500',
  },
  hazardous: {
    label: 'Hazardous',
    bgClass: 'bg-rose-900',
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
