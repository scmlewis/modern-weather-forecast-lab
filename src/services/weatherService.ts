import axios from 'axios';
import type {
  Coordinates,
  CurrentWeather,
  DailyForecast,
  ForecastPoint,
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
  ].join(','),
  hourly: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
    'precipitation_probability',
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
    condition: getWeatherCondition(data.current.weather_code),
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
    timezone: label.timezone ?? data.timezone,
  };

  return { current, hourly, daily };
};

const getForecastByLocation = async (location: OpenMeteoLocation): Promise<WeatherBundle> => {
  const response = await forecastApi.get<OpenMeteoForecastResponse>('/forecast', {
    params: forecastParams({
      lat: location.latitude,
      lon: location.longitude,
    }),
  });

  return normalizeForecast(response.data, location);
};

export const getWeatherByCity = async (city: string): Promise<WeatherBundle> => {
  const response = await geocodingApi.get<OpenMeteoGeocodingResponse>('/search', {
    params: {
      name: city.trim(),
      count: 1,
      language: 'en',
      format: 'json',
    },
  });

  const location = response.data.results?.[0];

  if (!location) {
    throw new Error(`No weather location found for "${city}". Try a nearby city or a more specific search.`);
  }

  return getForecastByLocation(location);
};

export const getWeatherByCoords = async ({ lat, lon }: Coordinates): Promise<WeatherBundle> => {
  const response = await forecastApi.get<OpenMeteoForecastResponse>('/forecast', {
    params: forecastParams({ lat, lon }),
  });

  return normalizeForecast(response.data);
};
