(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function a(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(t){if(t.ep)return;t.ep=!0;const r=a(t);fetch(t.href,r)}})();const P={apiKey:"3ce257e7ff96496ea4e184721252607",baseUrl:"https://api.weatherapi.com/v1",defaultCities:["New York","London","Tokyo","Madrid"],maxCities:4,updateInterval:6e5,units:"metric",language:"es"};class h extends Error{constructor(e,a,s){super(a),this.code=e,this.details=s,this.name="WeatherApiError"}}class k{config;cache=new Map;CACHE_DURATION=300*1e3;constructor(e={}){this.config={...P,...e}}async getWeatherData(e){try{const a=e.toLowerCase(),s=this.cache.get(a);if(s&&this.isCacheValid(s.timestamp))return console.log(`🔄 Datos de caché para ${e}`),s.data;console.log(`🌐 Obteniendo datos frescos para ${e}`);const[t,r]=await Promise.allSettled([this.fetchWeatherData(e),this.fetchAstronomyData(e)]);if(t.status==="rejected")throw this.createApiError(t.reason);const n=this.transformWeatherData(t.value,r.status==="fulfilled"?r.value:null);return this.cache.set(a,{data:n,timestamp:Date.now()}),n}catch(a){throw console.error(`❌ Error obteniendo datos para ${e}:`,a),a instanceof h?a:this.createApiError(a)}}async getMultipleCitiesWeather(e){console.log(`🏙️ Obteniendo datos para ${e.length} ciudades`);const a=e.map(async(t,r)=>(await this.delay(r*200),this.getWeatherData(t)));return(await Promise.allSettled(a)).filter(t=>t.status==="fulfilled").map(t=>t.value)}async searchCities(e){if(!e||e.length<2)return[];try{const a=this.buildApiUrl("search.json",{q:e}),s=await this.fetchWithTimeout(a);if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);return(await s.json()).map(r=>({name:r.name,country:r.country,region:r.region}))}catch(a){return console.error("Error searching cities:",a),[]}}async fetchWeatherData(e){const a={q:e,aqi:"yes",lang:this.config.language},s=this.buildApiUrl("current.json",a),t=await this.fetchWithTimeout(s);if(!t.ok){const r=await t.json().catch(()=>({}));throw new h(t.status,r.error?.message||`HTTP ${t.status}: ${t.statusText}`,r)}return t.json()}async fetchAstronomyData(e){const a={q:e,dt:new Date().toISOString().split("T")[0]},s=this.buildApiUrl("astronomy.json",a),t=await this.fetchWithTimeout(s);if(!t.ok)throw new Error(`Astronomy API error: ${t.status}`);return t.json()}transformWeatherData(e,a){const{location:s,current:t}=e;return{id:`${s.name}-${s.country}`.toLowerCase().replace(/\s+/g,"-"),name:s.name,country:s.country,region:s.region,temperature:Math.round(t.temp_c),feelsLike:Math.round(t.feelslike_c),condition:t.condition.text,conditionCode:t.condition.code,icon:t.condition.icon,humidity:t.humidity,windSpeed:Math.round(t.wind_kph),windDirection:t.wind_dir,pressure:Math.round(t.pressure_mb),uvIndex:t.uv,visibility:Math.round(t.vis_km),cloudCover:t.cloud,isDay:t.is_day===1,lastUpdated:new Date(t.last_updated),sunrise:a?.astronomy.astro.sunrise||"6:00 AM",sunset:a?.astronomy.astro.sunset||"6:00 PM",coordinates:{lat:s.lat,lon:s.lon},timezone:s.tz_id}}buildApiUrl(e,a={}){const s=new URL(`${this.config.baseUrl}/${e}`);return s.searchParams.set("key",this.config.apiKey),Object.entries(a).forEach(([t,r])=>{s.searchParams.set(t,String(r))}),s.toString()}async fetchWithTimeout(e,a=1e4){const s=new AbortController,t=setTimeout(()=>s.abort(),a);try{const r=await fetch(e,{signal:s.signal,headers:{Accept:"application/json","User-Agent":"WeatherApp/1.0"}});return clearTimeout(t),r}catch(r){throw clearTimeout(t),r instanceof Error&&r.name==="AbortError"?new h(408,"Request timeout"):r}}createApiError(e){if(e instanceof h)return e;if(e instanceof TypeError&&e.message.includes("fetch"))return new h(0,"Error de conexión. Verifica tu conexión a internet.");const a=e?.message||"Error desconocido al obtener datos del clima",s=e?.code||e?.status||500;return new h(s,a,e)}isCacheValid(e){return Date.now()-e<this.CACHE_DURATION}delay(e){return new Promise(a=>setTimeout(a,e))}clearCache(){this.cache.clear(),console.log("🧹 Caché limpiado")}getCacheStats(){const e=Date.now(),a=Array.from(this.cache.entries()).map(([s,t])=>({city:s,age:Math.round((e-t.timestamp)/1e3)}));return{size:this.cache.size,entries:a}}updateConfig(e){this.config={...this.config,...e},console.log("⚙️ Configuración actualizada",this.config)}getDefaultCities(){return[...this.config.defaultCities]}}const I=new k;let g=[];const E=4;let p,M,C,L,w;const x=(i,e)=>{const a=i.toLowerCase();return a.includes("sunny")||a.includes("clear")?e?"☀️":"🌙":a.includes("partly cloudy")||a.includes("partial")?e?"⛅":"🌙":a.includes("cloudy")||a.includes("overcast")?"☁️":a.includes("rain")||a.includes("drizzle")?"🌧️":a.includes("thunder")||a.includes("storm")?"⛈️":a.includes("snow")||a.includes("blizzard")?"❄️":a.includes("fog")||a.includes("mist")?"🌫️":a.includes("wind")?"💨":e?"🌤️":"🌙"};async function B(){console.log("🌤️ Iniciando Weather Dashboard...");const i=document.getElementById("app");i.innerHTML=`
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
  `,p=document.getElementById("cityInput"),M=document.getElementById("addCityBtn"),C=document.getElementById("weatherGrid"),L=document.getElementById("loading"),w=document.getElementById("errorMessage"),M.addEventListener("click",b),p.addEventListener("keypress",a=>{a.key==="Enter"&&b()}),$();const e=["Madrid","New York","London","Tokyo"];for(const a of e)g.length<E&&(await T(a),await new Promise(s=>setTimeout(s,300)))}function $(){const i=["Madrid","Barcelona","Valencia","Sevilla","Bilbao","Málaga","Murcia","Palma","Las Palmas","Zaragoza","Córdoba","Valladolid","Vigo","Gijón","Hospitalet","Vitoria","Coruña","Granada","Elche","Oviedo","New York","Los Angeles","Chicago","Houston","Miami","San Francisco","Boston","Seattle","Las Vegas","Denver","Atlanta","Philadelphia","Phoenix","San Diego","Dallas","San Jose","Austin","Detroit","Memphis","Portland","Bogotá","Medellín","Cali","Barranquilla","Cartagena","Bucaramanga","Pereira","Santa Marta","Ibagué","Pasto","Manizales","Neiva","Villavicencio","Armenia","Valledupar","Montería","Sincelejo","Popayán","Tunja","Florencia","Cúcuta","Soledad","Soacha","Palmira","Itagüí","Bello","Envigado","Tumaco","Apartadó","Tuluá","Mexico City","Guadalajara","Monterrey","Puebla","Tijuana","León","Juárez","Torreón","Querétaro","Saltillo","Aguascalientes","Mérida","Mexicali","Acapulco","Tlalnepantla","Cancún","Chihuahua","Naucalpan","Zapopan","Nezahualcóyotl","Buenos Aires","Córdoba","Rosario","Mendoza","La Plata","San Miguel de Tucumán","Mar del Plata","Salta","Santa Fe","San Juan","London","Paris","Berlin","Rome","Amsterdam","Vienna","Prague","Stockholm","Copenhagen","Brussels","Barcelona","Munich","Hamburg","Warsaw","Budapest","Zurich","Oslo","Helsinki","Dublin","Lisbon","Tokyo","Beijing","Seoul","Mumbai","Bangkok","Singapore","Shanghai","Hong Kong","Dubai","Delhi","Manila","Jakarta","Kuala Lumpur","Taipei","Ho Chi Minh City","Hanoi","Yangon","Dhaka","Karachi","Tehran","São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Porto Alegre","Santiago","Valparaíso","Concepción","La Serena","Antofagasta","Temuco","Rancagua","Talca","Arica","Chillán","Lima","Arequipa","Trujillo","Chiclayo","Piura","Iquitos","Cusco","Chimbote","Huancayo","Tacna","Caracas","Maracaibo","Valencia","Barquisimeto","Maracay","Ciudad Guayana","San Cristóbal","Maturín","Ciudad Bolívar","Cumana","Quito","Guayaquil","Cuenca","Santo Domingo","Machala","Manta","Portoviejo","Loja","Ambato","Riobamba","Cairo","Lagos","Cape Town","Nairobi","Sydney","Melbourne","Auckland","Perth","Brisbane","Adelaide","Johannesburg","Durban","Casablanca","Tunis","Algiers","Accra","Dakar","Abidjan","Kampala","Dar es Salaam"];let e=-1,a=!1;p.addEventListener("input",function(){const n=this.value.trim();if(r(),!n||n.length<2){a=!1;return}e=-1;const l=document.createElement("div");l.setAttribute("id","autocomplete-list"),l.setAttribute("class","autocomplete-items"),this.parentNode.appendChild(l);const c=i.filter(o=>{const d=o.toLowerCase(),u=n.toLowerCase();return d.startsWith(u)||d.includes(u)}).sort((o,d)=>{const u=o.toLowerCase(),A=d.toLowerCase(),v=n.toLowerCase(),m=u.startsWith(v),y=A.startsWith(v);return m&&!y?-1:!m&&y?1:o.length-d.length}).slice(0,8);if(c.length===0){const o=document.createElement("div");o.innerHTML=`
        <span style="opacity: 0.6; font-style: italic;">
          No se encontraron ciudades para "${n}"
        </span>
      `,o.style.cursor="default",o.style.padding="1rem 1.5rem",o.style.color="var(--text-secondary)",l.appendChild(o),a=!0;return}c.forEach((o,d)=>{const u=document.createElement("div"),A=o.toLowerCase(),v=n.toLowerCase(),m=A.indexOf(v);m!==-1?u.innerHTML=o.substr(0,m)+"<strong>"+o.substr(m,n.length)+"</strong>"+o.substr(m+n.length):u.textContent=o,u.addEventListener("click",function(y){y.preventDefault(),y.stopPropagation(),p.value=o,r(),b()}),u.setAttribute("data-index",d.toString()),l.appendChild(u)}),a=!0}),p.addEventListener("keydown",function(n){if(!a)return;const l=document.getElementById("autocomplete-list");if(!l)return;const c=l.getElementsByTagName("div");n.keyCode===40?(n.preventDefault(),e++,s(c)):n.keyCode===38?(n.preventDefault(),e--,s(c)):n.keyCode===13?(n.preventDefault(),e>-1&&c[e]?c[e].click():c.length>0&&c[0].textContent!=="No se encontraron ciudades"?c[0].click():b()):n.keyCode===27&&r()});function s(n){if(!(!n||n.length===0)){for(t(n);e>=0&&e<n.length&&n[e].style.cursor==="default";)e++;for(e>=n.length&&(e=0),e<0&&(e=n.length-1);e>=0&&e<n.length&&n[e].style.cursor==="default";)e--;e>=0&&e<n.length&&(n[e].classList.add("autocomplete-active"),n[e].scrollIntoView({block:"nearest"}))}}function t(n){Array.from(n).forEach(l=>l.classList.remove("autocomplete-active"))}function r(){const n=document.getElementsByClassName("autocomplete-items");Array.from(n).forEach(l=>l.remove()),a=!1,e=-1}document.addEventListener("click",function(n){p.contains(n.target)||r()}),window.addEventListener("scroll",r)}async function b(){const i=p.value.trim();if(!i){f("Por favor ingresa el nombre de una ciudad");return}if(g.length>=E){f(`Máximo ${E} ciudades permitidas`);return}if(g.some(e=>e.name.toLowerCase()===i.toLowerCase())){f("Esta ciudad ya está agregada");return}await T(i),p.value=""}async function T(i){D(!0);try{const e=await I.getWeatherData(i);g.push(e),W(e),f("")}catch(e){console.error("Error cargando datos del clima:",e),f(`No se pudo cargar el clima para "${i}". Verifica el nombre de la ciudad.`)}finally{D(!1)}}function W(i){const e=document.createElement("div");e.className="weather-card",e.setAttribute("data-city",i.name);const a=x(i.condition,i.isDay);e.innerHTML=`
    <div class="city-header">
      <h2 class="city-name">${i.name}</h2>
      <span class="country">${i.country}</span>
      <button class="remove-btn" onclick="removeCity('${i.name}')" title="Eliminar ciudad">
        <span class="remove-icon">×</span>
      </button>
    </div>
    
    <div class="weather-main">
      <div class="temperature-display">
        <span class="temperature">${Math.round(i.temperature)}°C</span>
        <span class="feels-like">Sensación térmica: ${Math.round(i.feelsLike)}°C</span>
      </div>
      <div class="weather-icon-container">
        <span class="weather-icon">${a}</span>
      </div>
    </div>
    
    <div class="weather-condition">${i.condition}</div>
    
    <div class="weather-details">
      <div class="detail-item">
        <span class="detail-icon">💧</span>
        <div class="detail-content">
          <span class="detail-label">HUMEDAD</span>
          <span class="detail-value">${i.humidity}%</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">💨</span>
        <div class="detail-content">
          <span class="detail-label">VIENTO</span>
          <span class="detail-value">${i.windSpeed} km/h</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">🌡️</span>
        <div class="detail-content">
          <span class="detail-label">PRESIÓN</span>
          <span class="detail-value">${i.pressure} mb</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">☀️</span>
        <div class="detail-content">
          <span class="detail-label">UV INDEX</span>
          <span class="detail-value">${i.uvIndex}</span>
        </div>
      </div>
      
      <div class="detail-item full-width">
        <span class="detail-icon">🌅</span>
        <div class="detail-content">
          <span class="detail-label">AMANECER</span>
          <span class="detail-value">${i.sunrise}</span>
        </div>
      </div>
      
      <div class="detail-item full-width">
        <span class="detail-icon">🌇</span>
        <div class="detail-content">
          <span class="detail-label">ATARDECER</span>
          <span class="detail-value">${i.sunset}</span>
        </div>
      </div>
    </div>
    
    <div class="last-updated">
      Última actualización: ${new Date(i.lastUpdated).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}
    </div>
  `,e.style.opacity="0",e.style.transform="translateY(20px)",C.appendChild(e),requestAnimationFrame(()=>{e.style.transition="all 0.5s ease",e.style.opacity="1",e.style.transform="translateY(0)"})}window.removeCity=function(i){const e=document.querySelector(`[data-city="${i}"]`);if(e){const s=Array.from(C.querySelectorAll(".weather-card")).map(t=>({element:t,rect:t.getBoundingClientRect()}));e.style.transition="all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",e.style.transform="scale(0.8) translateY(-20px)",e.style.opacity="0",e.style.filter="blur(3px)",e.style.pointerEvents="none",setTimeout(()=>{g=g.filter(n=>n.name!==i),e.remove();const t=Array.from(C.querySelectorAll(".weather-card")),r=t.map(n=>({element:n,rect:n.getBoundingClientRect()}));t.forEach(n=>{const l=s.find(o=>o.element===n),c=r.find(o=>o.element===n);if(l&&c){const o=l.rect.left-c.rect.left,d=l.rect.top-c.rect.top;(Math.abs(o)>2||Math.abs(d)>2)&&(n.style.transition="none",n.style.transform=`translate(${o}px, ${d}px)`,n.offsetHeight,requestAnimationFrame(()=>{n.style.transition="transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",n.style.transform="translate(0px, 0px)",setTimeout(()=>{n.style.transition="",n.style.transform=""},600)}))}})},500)}};function D(i){L&&(L.style.display=i?"block":"none")}function f(i){w&&(w.textContent=i,w.style.display=i?"block":"none",i&&setTimeout(()=>{f("")},5e3))}async function S(){try{if(console.log("🌤️ Iniciando Weather Dashboard..."),!document.getElementById("app"))throw new Error("Container #app not found");await B(),console.log("✅ Weather Dashboard iniciado correctamente")}catch(i){console.error("❌ Error fatal:",i);const e=document.getElementById("app");e&&(e.innerHTML=`
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          color: #ef4444;
          font-family: system-ui, sans-serif;
          padding: 2rem;
        ">
          <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
          <h1 style="margin-bottom: 1rem;">Error Fatal</h1>
          <p style="margin-bottom: 2rem; max-width: 500px; line-height: 1.6;">
            No se pudo inicializar la aplicación del clima. 
            Verifica tu conexión a internet y recarga la página.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: white;
              border: none;
              padding: 1rem 2rem;
              border-radius: 50px;
              font-size: 1.1rem;
              cursor: pointer;
              transition: transform 0.2s;
            "
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            🔄 Recargar Página
          </button>
          <p style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.7;">
            Error: ${i instanceof Error?i.message:"Unknown error"}
          </p>
        </div>
      `)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",S):S();
