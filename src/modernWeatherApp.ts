import { weatherService } from './services/weatherApi';
import type { CityWeatherData } from './types/weather';

// Variables globales
let cities: CityWeatherData[] = [];
const MAX_CITIES = 4;

// Elementos del DOM
let cityInput: HTMLInputElement;
let addCityBtn: HTMLButtonElement;
let weatherGrid: HTMLElement;
let loading: HTMLElement;
let errorMessage: HTMLElement;

// Iconos más vivos y animados
const getWeatherIcon = (condition: string, isDay: boolean): string => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return isDay ? '☀️' : '🌙';
  }
  if (conditionLower.includes('partly cloudy') || conditionLower.includes('partial')) {
    return isDay ? '⛅' : '🌙';
  }
  if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return '☁️';
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return '🌧️';
  }
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return '⛈️';
  }
  if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
    return '❄️';
  }
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return '🌫️';
  }
  if (conditionLower.includes('wind')) {
    return '💨';
  }
  
  return isDay ? '🌤️' : '🌙';
};

// Inicializar la aplicación
export async function initApp(): Promise<void> {
  console.log('🌤️ Iniciando Weather Dashboard...');
  
  // Crear la estructura de la aplicación
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="container">
      <header class="header">
        <h1>🌤️ Weather Dashboard</h1>
        <div class="search-container">
          <input type="text" id="cityInput" class="search-input" placeholder="Agregar ciudad...">
          <button id="addCityBtn" class="add-btn">+</button>
        </div>
      </header>

      <div id="loading" class="loading" style="display: none;">
        Cargando datos del clima...
      </div>

      <div id="errorMessage" class="error" style="display: none;"></div>

      <main id="weatherGrid" class="weather-grid">
        <!-- Las tarjetas del clima se generarán aquí -->
      </main>
    </div>
  `;
  
  // Obtener elementos del DOM
  cityInput = document.getElementById('cityInput') as HTMLInputElement;
  addCityBtn = document.getElementById('addCityBtn') as HTMLButtonElement;
  weatherGrid = document.getElementById('weatherGrid') as HTMLElement;
  loading = document.getElementById('loading') as HTMLElement;
  errorMessage = document.getElementById('errorMessage') as HTMLElement;

  // Event listeners
  addCityBtn.addEventListener('click', addCity);
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCity();
    }
  });

  // Autocompletado
  setupAutoComplete();
  
  // Cargar ciudades por defecto
  const defaultCities = ['Madrid', 'New York', 'London', 'Tokyo'];
  
  for (const city of defaultCities) {
    if (cities.length < MAX_CITIES) {
      await loadWeatherData(city);
      // Pequeña pausa entre llamadas
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

// Configurar autocompletado
function setupAutoComplete(): void {
  const suggestions = [
    // España
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Zaragoza',
    'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'Coruña', 'Granada', 'Elche', 'Oviedo',
    
    // Estados Unidos
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Boston', 'Seattle', 'Las Vegas', 'Denver',
    'Atlanta', 'Philadelphia', 'Phoenix', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Detroit', 'Memphis', 'Portland',
    
    // Colombia
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto',
    'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Tunja', 'Florencia',
    'Cúcuta', 'Soledad', 'Soacha', 'Palmira', 'Itagüí', 'Bello', 'Envigado', 'Tumaco', 'Apartadó', 'Tuluá',
    
    // México
    'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Saltillo',
    'Aguascalientes', 'Mérida', 'Mexicali', 'Acapulco', 'Tlalnepantla', 'Cancún', 'Chihuahua', 'Naucalpan', 'Zapopan', 'Nezahualcóyotl',
    
    // Argentina
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan',
    
    // Europa
    'London', 'Paris', 'Berlin', 'Rome', 'Amsterdam', 'Vienna', 'Prague', 'Stockholm', 'Copenhagen', 'Brussels',
    'Barcelona', 'Munich', 'Hamburg', 'Warsaw', 'Budapest', 'Zurich', 'Oslo', 'Helsinki', 'Dublin', 'Lisbon',
    
    // Asia
    'Tokyo', 'Beijing', 'Seoul', 'Mumbai', 'Bangkok', 'Singapore', 'Shanghai', 'Hong Kong', 'Dubai', 'Delhi',
    'Manila', 'Jakarta', 'Kuala Lumpur', 'Taipei', 'Ho Chi Minh City', 'Hanoi', 'Yangon', 'Dhaka', 'Karachi', 'Tehran',
    
    // Brasil
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    
    // Chile
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
    
    // Perú
    'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna',
    
    // Venezuela
    'Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Maturín', 'Ciudad Bolívar', 'Cumana',
    
    // Ecuador
    'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Manta', 'Portoviejo', 'Loja', 'Ambato', 'Riobamba',
    
    // África y Oceanía
    'Cairo', 'Lagos', 'Cape Town', 'Nairobi', 'Sydney', 'Melbourne', 'Auckland', 'Perth', 'Brisbane', 'Adelaide',
    'Johannesburg', 'Durban', 'Casablanca', 'Tunis', 'Algiers', 'Accra', 'Dakar', 'Abidjan', 'Kampala', 'Dar es Salaam'
  ];

  let currentFocus = -1;
  let isAutoCompleteOpen = false;
  
  cityInput.addEventListener('input', function() {
    const value = this.value.trim();
    closeAllLists();
    
    if (!value || value.length < 2) {
      isAutoCompleteOpen = false;
      return;
    }
    
    currentFocus = -1;
    
    const listContainer = document.createElement('div');
    listContainer.setAttribute('id', 'autocomplete-list');
    listContainer.setAttribute('class', 'autocomplete-items');
    this.parentNode!.appendChild(listContainer);
    
    // Filtros más inteligentes
    const filteredSuggestions = suggestions
      .filter(city => {
        const cityLower = city.toLowerCase();
        const valueLower = value.toLowerCase();
        
        // Coincidencia al principio tiene prioridad
        return cityLower.startsWith(valueLower) || cityLower.includes(valueLower);
      })
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const valueLower = value.toLowerCase();
        
        // Priorizar coincidencias al principio
        const aStarts = aLower.startsWith(valueLower);
        const bStarts = bLower.startsWith(valueLower);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Luego por longitud (más corto = más relevante)
        return a.length - b.length;
      })
      .slice(0, 8); // Mostrar hasta 8 sugerencias
    
    if (filteredSuggestions.length === 0) {
      const noResults = document.createElement('div');
      noResults.innerHTML = `
        <span style="opacity: 0.6; font-style: italic;">
          No se encontraron ciudades para "${value}"
        </span>
      `;
      noResults.style.cursor = 'default';
      noResults.style.padding = '1rem 1.5rem';
      noResults.style.color = 'var(--text-secondary)';
      listContainer.appendChild(noResults);
      isAutoCompleteOpen = true;
      return;
    }
    
    filteredSuggestions.forEach((city, index) => {
      const item = document.createElement('div');
      const cityLower = city.toLowerCase();
      const valueLower = value.toLowerCase();
      const matchIndex = cityLower.indexOf(valueLower);
      
      if (matchIndex !== -1) {
        item.innerHTML = 
          city.substr(0, matchIndex) + 
          '<strong>' + city.substr(matchIndex, value.length) + '</strong>' + 
          city.substr(matchIndex + value.length);
      } else {
        item.textContent = city;
      }
      
      item.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        cityInput.value = city;
        closeAllLists();
        addCity();
      });
      
      // Agregar atributo para el índice
      item.setAttribute('data-index', index.toString());
      
      listContainer.appendChild(item);
    });
    
    isAutoCompleteOpen = true;
  });

  cityInput.addEventListener('keydown', function(e) {
    if (!isAutoCompleteOpen) return;
    
    const list = document.getElementById('autocomplete-list');
    if (!list) return;
    
    const items = list.getElementsByTagName('div');
    
    if (e.keyCode === 40) { // Arrow DOWN
      e.preventDefault();
      currentFocus++;
      addActive(items);
    } else if (e.keyCode === 38) { // Arrow UP
      e.preventDefault();
      currentFocus--;
      addActive(items);
    } else if (e.keyCode === 13) { // Enter
      e.preventDefault();
      if (currentFocus > -1 && items[currentFocus]) {
        items[currentFocus].click();
      } else {
        // Si no hay selección, usar la primera sugerencia si existe
        if (items.length > 0 && items[0].textContent !== "No se encontraron ciudades") {
          items[0].click();
        } else {
          addCity();
        }
      }
    } else if (e.keyCode === 27) { // Escape
      closeAllLists();
    }
  });

  function addActive(items: HTMLCollectionOf<HTMLDivElement>): void {
    if (!items || items.length === 0) return;
    
    removeActive(items);
    
    // Saltar elementos que no son seleccionables
    while (currentFocus >= 0 && currentFocus < items.length && 
           items[currentFocus].style.cursor === 'default') {
      currentFocus++;
    }
    
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    
    // Saltar elementos que no son seleccionables hacia atrás
    while (currentFocus >= 0 && currentFocus < items.length && 
           items[currentFocus].style.cursor === 'default') {
      currentFocus--;
    }
    
    if (currentFocus >= 0 && currentFocus < items.length) {
      items[currentFocus].classList.add('autocomplete-active');
      items[currentFocus].scrollIntoView({ block: 'nearest' });
    }
  }

  function removeActive(items: HTMLCollectionOf<HTMLDivElement>): void {
    Array.from(items).forEach(item => item.classList.remove('autocomplete-active'));
  }

  function closeAllLists(): void {
    const lists = document.getElementsByClassName('autocomplete-items');
    Array.from(lists).forEach(list => list.remove());
    isAutoCompleteOpen = false;
    currentFocus = -1;
  }

  // Cerrar al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!cityInput.contains(e.target as Node)) {
      closeAllLists();
    }
  });
  
  // Cerrar al hacer scroll
  window.addEventListener('scroll', closeAllLists);
}

// Agregar nueva ciudad
async function addCity(): Promise<void> {
  const cityName = cityInput.value.trim();
  
  if (!cityName) {
    showError('Por favor ingresa el nombre de una ciudad');
    return;
  }
  
  if (cities.length >= MAX_CITIES) {
    showError(`Máximo ${MAX_CITIES} ciudades permitidas`);
    return;
  }
  
  if (cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
    showError('Esta ciudad ya está agregada');
    return;
  }
  
  await loadWeatherData(cityName);
  cityInput.value = '';
}

// Cargar datos del clima
async function loadWeatherData(cityName: string): Promise<void> {
  showLoading(true);
  
  try {
    const weatherData = await weatherService.getWeatherData(cityName);
    cities.push(weatherData);
    renderWeatherCard(weatherData);
    showError(''); // Limpiar errores
  } catch (error) {
    console.error('Error cargando datos del clima:', error);
    showError(`No se pudo cargar el clima para "${cityName}". Verifica el nombre de la ciudad.`);
  } finally {
    showLoading(false);
  }
}

// Renderizar tarjeta del clima
function renderWeatherCard(data: CityWeatherData): void {
  const card = document.createElement('div');
  card.className = 'weather-card';
  card.setAttribute('data-city', data.name);
  
  const weatherIcon = getWeatherIcon(data.condition, data.isDay);
  
  card.innerHTML = `
    <div class="city-header">
      <h2 class="city-name">${data.name}</h2>
      <span class="country">${data.country}</span>
      <button class="remove-btn" onclick="removeCity('${data.name}')" title="Eliminar ciudad">
        <span class="remove-icon">×</span>
      </button>
    </div>
    
    <div class="weather-main">
      <div class="temperature-display">
        <span class="temperature">${Math.round(data.temperature)}°C</span>
        <span class="feels-like">Sensación térmica: ${Math.round(data.feelsLike)}°C</span>
      </div>
      <div class="weather-icon-container">
        <span class="weather-icon">${weatherIcon}</span>
      </div>
    </div>
    
    <div class="weather-condition">${data.condition}</div>
    
    <div class="weather-details">
      <div class="detail-item">
        <span class="detail-icon">💧</span>
        <div class="detail-content">
          <span class="detail-label">HUMEDAD</span>
          <span class="detail-value">${data.humidity}%</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">💨</span>
        <div class="detail-content">
          <span class="detail-label">VIENTO</span>
          <span class="detail-value">${data.windSpeed} km/h</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">🌡️</span>
        <div class="detail-content">
          <span class="detail-label">PRESIÓN</span>
          <span class="detail-value">${data.pressure} mb</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">☀️</span>
        <div class="detail-content">
          <span class="detail-label">UV INDEX</span>
          <span class="detail-value">${data.uvIndex}</span>
        </div>
      </div>
      
      <div class="detail-item full-width">
        <span class="detail-icon">🌅</span>
        <div class="detail-content">
          <span class="detail-label">AMANECER</span>
          <span class="detail-value">${data.sunrise}</span>
        </div>
      </div>
      
      <div class="detail-item full-width">
        <span class="detail-icon">🌇</span>
        <div class="detail-content">
          <span class="detail-label">ATARDECER</span>
          <span class="detail-value">${data.sunset}</span>
        </div>
      </div>
    </div>
    
    <div class="last-updated">
      Última actualización: ${new Date(data.lastUpdated).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </div>
  `;
  
  // Animación de entrada
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  
  weatherGrid.appendChild(card);
  
  // Trigger animation
  requestAnimationFrame(() => {
    card.style.transition = 'all 0.5s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
}

// Eliminar ciudad
(window as any).removeCity = function(cityName: string): void {
  const cityCard = document.querySelector(`[data-city="${cityName}"]`) as HTMLElement;
  if (cityCard) {
    // STEP 1: Capturar posiciones ANTES de eliminar (FIRST)
    const allCards = Array.from(weatherGrid.querySelectorAll('.weather-card')) as HTMLElement[];
    const firstPositions = allCards.map(card => ({
      element: card,
      rect: card.getBoundingClientRect()
    }));
    
    // Aplicar animación de salida a la tarjeta eliminada
    cityCard.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    cityCard.style.transform = 'scale(0.8) translateY(-20px)';
    cityCard.style.opacity = '0';
    cityCard.style.filter = 'blur(3px)';
    cityCard.style.pointerEvents = 'none';
    
    // Remover después de la animación de salida
    setTimeout(() => {
      // Actualizar el array de ciudades
      cities = cities.filter(city => city.name !== cityName);
      
      // Remover la tarjeta del DOM
      cityCard.remove();
      
      // STEP 2: Capturar nuevas posiciones DESPUÉS de eliminar (LAST)
      const remainingCards = Array.from(weatherGrid.querySelectorAll('.weather-card')) as HTMLElement[];
      const lastPositions = remainingCards.map(card => ({
        element: card,
        rect: card.getBoundingClientRect()
      }));
      
      // STEP 3: INVERT - Calcular diferencias y aplicar transformaciones
      remainingCards.forEach(card => {
        const firstPos = firstPositions.find(pos => pos.element === card);
        const lastPos = lastPositions.find(pos => pos.element === card);
        
        if (firstPos && lastPos) {
          const deltaX = firstPos.rect.left - lastPos.rect.left;
          const deltaY = firstPos.rect.top - lastPos.rect.top;
          
          // Solo animar si hay movimiento significativo
          if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            // Posicionar en la posición anterior sin transición
            card.style.transition = 'none';
            card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            // Forzar reflow
            card.offsetHeight;
            
            // STEP 4: PLAY - Animar de vuelta a la posición final
            requestAnimationFrame(() => {
              card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
              card.style.transform = 'translate(0px, 0px)';
              
              // Limpiar estilos después de la animación
              setTimeout(() => {
                card.style.transition = '';
                card.style.transform = '';
              }, 600);
            });
          }
        }
      });
      
    }, 500);
  }
};

// Mostrar loading
function showLoading(show: boolean): void {
  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  }
}

// Mostrar error
function showError(message: string): void {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = message ? 'block' : 'none';
    
    if (message) {
      setTimeout(() => {
        showError('');
      }, 5000);
    }
  }
}
