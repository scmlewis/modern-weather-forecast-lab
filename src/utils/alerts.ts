import type { WeatherBundle } from '../types/weather';

export type AlertSeverity = 'medium' | 'high';

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
}

export const checkAlerts = (weather: WeatherBundle): Alert[] => {
  const alerts: Alert[] = [];
  const { current, daily } = weather;

  // Wind Advisory
  if (current.windSpeed > 13.9) { // > 50 km/h
    alerts.push({
      id: 'wind-advisory',
      type: 'Wind Advisory',
      severity: 'high',
      message: `Strong winds of ${current.windSpeed.toFixed(1)} m/s. Secure loose objects and avoid outdoor activities.`,
    });
  }

  // Extreme Heat
  if (current.temperature > 35) {
    alerts.push({
      id: 'extreme-heat',
      type: 'Extreme Heat',
      severity: 'high',
      message: `Temperature of ${current.temperature.toFixed(1)}°C. Stay hydrated and limit sun exposure.`,
    });
  }

  // Extreme Cold
  if (current.temperature < -10) {
    alerts.push({
      id: 'extreme-cold',
      type: 'Extreme Cold',
      severity: 'high',
      message: `Temperature of ${current.temperature.toFixed(1)}°C. Bundle up and limit time outdoors.`,
    });
  }

  // Heavy Rain (check today's forecast)
  const todayPrecip = daily[0]?.precipitationSum ?? 0;
  if (todayPrecip > 20) {
    alerts.push({
      id: 'heavy-rain',
      type: 'Heavy Rain',
      severity: 'medium',
      message: `Expected ${todayPrecip.toFixed(1)} mm of precipitation today. Be prepared for wet conditions.`,
    });
  }

  // High UV
  if (current.uvIndex != null && current.uvIndex > 8) {
    alerts.push({
      id: 'high-uv',
      type: 'High UV',
      severity: 'medium',
      message: `UV Index of ${current.uvIndex.toFixed(0)}. Wear sunscreen and seek shade during midday.`,
    });
  }

  // Low Visibility
  if (current.visibilityKm != null && current.visibilityKm < 1) {
    alerts.push({
      id: 'low-visibility',
      type: 'Low Visibility',
      severity: 'medium',
      message: `Visibility reduced to ${current.visibilityKm.toFixed(1)} km. Drive carefully and use fog lights.`,
    });
  }

  return alerts;
};
