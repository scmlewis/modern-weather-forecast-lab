export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  code: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  name: string;
  country: string;
  coordinates: Coordinates;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number | null;
  pressure: number | null;
  visibilityKm: number | null;
  cloudCover: number | null;
  precipitationRate: number | null;
  condition: WeatherCondition;
  sunrise: string;
  sunset: string;
  timezone: string;
}

export interface ForecastPoint {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  precipitationChance: number;
}

export interface DailyForecast {
  date: string;
  min: number;
  max: number;
  condition: WeatherCondition;
  precipitationSum: number;
  maxWindSpeed: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherBundle {
  current: CurrentWeather;
  hourly: ForecastPoint[];
  daily: DailyForecast[];
  currentHourlyIndex: number;
}

export interface LocationSuggestion {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  label: string;
}

export type RecentSearchEntry = {
  id: string;
  label: string;
  kind: 'city' | 'location' | 'coords';
  dedupeKey?: string;
  query?: string;
  location?: LocationSuggestion;
  coords?: Coordinates;
};

export interface OpenMeteoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  timezone?: string;
  admin1?: string;
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoLocation[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    precipitation_probability: number[];
    surface_pressure: number[];
    visibility: number[];
    cloud_cover: number[];
    wind_gusts_10m: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}
