// Tipos para la API de WeatherAPI.com
export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherCurrent {
  last_updated_epoch: number;
  last_updated: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
}

export interface WeatherAstronomy {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: string;
}

export interface WeatherApiResponse {
  location: WeatherLocation;
  current: WeatherCurrent;
}

export interface AstronomyApiResponse {
  location: WeatherLocation;
  astronomy: {
    astro: WeatherAstronomy;
  };
}

// Tipos internos de la aplicación
export interface CityWeatherData {
  id: string;
  name: string;
  country: string;
  region: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  visibility: number;
  cloudCover: number;
  isDay: boolean;
  lastUpdated: Date;
  sunrise: string;
  sunset: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  timezone: string;
}

export interface WeatherState {
  cities: CityWeatherData[];
  isLoading: boolean;
  error: string | null;
  maxCities: number;
}

export interface ApiError {
  code: number;
  message: string;
}

export interface WeatherIconMap {
  [key: number]: {
    day: string;
    night: string;
    emoji: string;
  };
}

// Tipos para eventos y callbacks
export type WeatherEventType = 'city-added' | 'city-removed' | 'weather-updated' | 'error';

export interface WeatherEvent {
  type: WeatherEventType;
  payload?: any;
  timestamp: Date;
}

export type WeatherEventCallback = (event: WeatherEvent) => void;

// Tipos para configuración
export interface WeatherConfig {
  apiKey: string;
  baseUrl: string;
  defaultCities: string[];
  maxCities: number;
  updateInterval: number;
  units: 'metric' | 'imperial';
  language: string;
}

// Tipos para animaciones
export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
}

export interface CardAnimationVariants {
  hidden: any;
  visible: any;
  exit: any;
}
