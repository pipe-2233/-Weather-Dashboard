import type { 
  WeatherApiResponse, 
  AstronomyApiResponse, 
  CityWeatherData, 
  WeatherConfig 
} from '@/types';

/**
 * Configuración del servicio de clima
 */
const WEATHER_CONFIG: WeatherConfig = {
  apiKey: '3ce257e7ff96496ea4e184721252607',
  baseUrl: 'https://api.weatherapi.com/v1',
  defaultCities: ['New York', 'London', 'Tokyo', 'Madrid'],
  maxCities: 4,
  updateInterval: 600000, // 10 minutos
  units: 'metric',
  language: 'es'
};

/**
 * Clase para manejar errores de la API
 */
export class WeatherApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

/**
 * Servicio principal para interactuar con la API de WeatherAPI
 */
export class WeatherApiService {
  private config: WeatherConfig;
  private cache: Map<string, { data: CityWeatherData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(config: Partial<WeatherConfig> = {}) {
    this.config = { ...WEATHER_CONFIG, ...config };
  }

  /**
   * Obtiene los datos del clima para una ciudad
   */
  async getWeatherData(cityName: string): Promise<CityWeatherData> {
    try {
      // Verificar caché
      const cacheKey = cityName.toLowerCase();
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        console.log(`🔄 Datos de caché para ${cityName}`);
        return cachedData.data;
      }

      console.log(`🌐 Obteniendo datos frescos para ${cityName}`);

      // Obtener datos del clima y astronomía en paralelo
      const [weatherData, astronomyData] = await Promise.allSettled([
        this.fetchWeatherData(cityName),
        this.fetchAstronomyData(cityName)
      ]);

      if (weatherData.status === 'rejected') {
        throw this.createApiError(weatherData.reason);
      }

      const cityData = this.transformWeatherData(
        weatherData.value,
        astronomyData.status === 'fulfilled' ? astronomyData.value : null
      );

      // Guardar en caché
      this.cache.set(cacheKey, {
        data: cityData,
        timestamp: Date.now()
      });

      return cityData;

    } catch (error) {
      console.error(`❌ Error obteniendo datos para ${cityName}:`, error);
      throw error instanceof WeatherApiError ? error : this.createApiError(error);
    }
  }

  /**
   * Obtiene datos del clima para múltiples ciudades
   */
  async getMultipleCitiesWeather(cities: string[]): Promise<CityWeatherData[]> {
    console.log(`🏙️ Obteniendo datos para ${cities.length} ciudades`);
    
    const promises = cities.map(async (city, index) => {
      // Agregar delay para evitar rate limiting
      await this.delay(index * 200);
      return this.getWeatherData(city);
    });

    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<CityWeatherData> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Busca ciudades por nombre
   */
  async searchCities(query: string): Promise<Array<{name: string; country: string; region: string}>> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const url = this.buildApiUrl('search.json', { q: query });
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.map((city: any) => ({
        name: city.name,
        country: city.country,
        region: city.region
      }));

    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  /**
   * Obtiene datos del clima actual
   */
  private async fetchWeatherData(cityName: string): Promise<WeatherApiResponse> {
    const params = {
      q: cityName,
      aqi: 'yes',
      lang: this.config.language
    };

    const url = this.buildApiUrl('current.json', params);
    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WeatherApiError(
        response.status,
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    return response.json();
  }

  /**
   * Obtiene datos de astronomía
   */
  private async fetchAstronomyData(cityName: string): Promise<AstronomyApiResponse> {
    const params = {
      q: cityName,
      dt: new Date().toISOString().split('T')[0]
    };

    const url = this.buildApiUrl('astronomy.json', params);
    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Astronomy API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Transforma los datos de la API al formato interno
   */
  private transformWeatherData(
    weatherData: WeatherApiResponse,
    astronomyData: AstronomyApiResponse | null
  ): CityWeatherData {
    const { location, current } = weatherData;
    
    return {
      id: `${location.name}-${location.country}`.toLowerCase().replace(/\s+/g, '-'),
      name: location.name,
      country: location.country,
      region: location.region,
      temperature: Math.round(current.temp_c),
      feelsLike: Math.round(current.feelslike_c),
      condition: current.condition.text,
      conditionCode: current.condition.code,
      icon: current.condition.icon,
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      windDirection: current.wind_dir,
      pressure: Math.round(current.pressure_mb),
      uvIndex: current.uv,
      visibility: Math.round(current.vis_km),
      cloudCover: current.cloud,
      isDay: current.is_day === 1,
      lastUpdated: new Date(current.last_updated),
      sunrise: astronomyData?.astronomy.astro.sunrise || '6:00 AM',
      sunset: astronomyData?.astronomy.astro.sunset || '6:00 PM',
      coordinates: {
        lat: location.lat,
        lon: location.lon
      },
      timezone: location.tz_id
    };
  }

  /**
   * Construye URL de la API con parámetros
   */
  private buildApiUrl(endpoint: string, params: Record<string, string | number> = {}): string {
    const url = new URL(`${this.config.baseUrl}/${endpoint}`);
    url.searchParams.set('key', this.config.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    return url.toString();
  }

  /**
   * Fetch con timeout personalizado
   */
  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WeatherApp/1.0'
        }
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new WeatherApiError(408, 'Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Crea un error de API estandarizado
   */
  private createApiError(error: any): WeatherApiError {
    if (error instanceof WeatherApiError) {
      return error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new WeatherApiError(0, 'Error de conexión. Verifica tu conexión a internet.');
    }

    const message = error?.message || 'Error desconocido al obtener datos del clima';
    const code = error?.code || error?.status || 500;

    return new WeatherApiError(code, message, error);
  }

  /**
   * Verifica si los datos en caché son válidos
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Delay utility para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Caché limpiado');
  }

  /**
   * Obtiene estadísticas del caché
   */
  getCacheStats(): { size: number; entries: Array<{city: string; age: number}> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([city, data]) => ({
      city,
      age: Math.round((now - data.timestamp) / 1000) // en segundos
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<WeatherConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración actualizada', this.config);
  }

  /**
   * Obtiene las ciudades por defecto
   */
  getDefaultCities(): string[] {
    return [...this.config.defaultCities];
  }
}

// Instancia singleton del servicio
export const weatherService = new WeatherApiService();
