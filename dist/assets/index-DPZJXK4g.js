(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(t){if(t.ep)return;t.ep=!0;const n=a(t);fetch(t.href,n)}})();const L={apiKey:"3ce257e7ff96496ea4e184721252607",baseUrl:"https://api.weatherapi.com/v1",defaultCities:["New York","London","Tokyo","Madrid"],maxCities:4,updateInterval:6e5,units:"metric",language:"es"};class l extends Error{constructor(e,a,i){super(a),this.code=e,this.details=i,this.name="WeatherApiError"}}class D{config;cache=new Map;CACHE_DURATION=300*1e3;constructor(e={}){this.config={...L,...e}}async getWeatherData(e){try{const a=e.toLowerCase(),i=this.cache.get(a);if(i&&this.isCacheValid(i.timestamp))return console.log(`🔄 Datos de caché para ${e}`),i.data;console.log(`🌐 Obteniendo datos frescos para ${e}`);const[t,n]=await Promise.allSettled([this.fetchWeatherData(e),this.fetchAstronomyData(e)]);if(t.status==="rejected")throw this.createApiError(t.reason);const r=this.transformWeatherData(t.value,n.status==="fulfilled"?n.value:null);return this.cache.set(a,{data:r,timestamp:Date.now()}),r}catch(a){throw console.error(`❌ Error obteniendo datos para ${e}:`,a),a instanceof l?a:this.createApiError(a)}}async getMultipleCitiesWeather(e){console.log(`🏙️ Obteniendo datos para ${e.length} ciudades`);const a=e.map(async(t,n)=>(await this.delay(n*200),this.getWeatherData(t)));return(await Promise.allSettled(a)).filter(t=>t.status==="fulfilled").map(t=>t.value)}async searchCities(e){if(!e||e.length<2)return[];try{const a=this.buildApiUrl("search.json",{q:e}),i=await this.fetchWithTimeout(a);if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);return(await i.json()).map(n=>({name:n.name,country:n.country,region:n.region}))}catch(a){return console.error("Error searching cities:",a),[]}}async fetchWeatherData(e){const a={q:e,aqi:"yes",lang:this.config.language},i=this.buildApiUrl("current.json",a),t=await this.fetchWithTimeout(i);if(!t.ok){const n=await t.json().catch(()=>({}));throw new l(t.status,n.error?.message||`HTTP ${t.status}: ${t.statusText}`,n)}return t.json()}async fetchAstronomyData(e){const a={q:e,dt:new Date().toISOString().split("T")[0]},i=this.buildApiUrl("astronomy.json",a),t=await this.fetchWithTimeout(i);if(!t.ok)throw new Error(`Astronomy API error: ${t.status}`);return t.json()}transformWeatherData(e,a){const{location:i,current:t}=e;return{id:`${i.name}-${i.country}`.toLowerCase().replace(/\s+/g,"-"),name:i.name,country:i.country,region:i.region,temperature:Math.round(t.temp_c),feelsLike:Math.round(t.feelslike_c),condition:t.condition.text,conditionCode:t.condition.code,icon:t.condition.icon,humidity:t.humidity,windSpeed:Math.round(t.wind_kph),windDirection:t.wind_dir,pressure:Math.round(t.pressure_mb),uvIndex:t.uv,visibility:Math.round(t.vis_km),cloudCover:t.cloud,isDay:t.is_day===1,lastUpdated:new Date(t.last_updated),sunrise:a?.astronomy.astro.sunrise||"6:00 AM",sunset:a?.astronomy.astro.sunset||"6:00 PM",coordinates:{lat:i.lat,lon:i.lon},timezone:i.tz_id}}buildApiUrl(e,a={}){const i=new URL(`${this.config.baseUrl}/${e}`);return i.searchParams.set("key",this.config.apiKey),Object.entries(a).forEach(([t,n])=>{i.searchParams.set(t,String(n))}),i.toString()}async fetchWithTimeout(e,a=1e4){const i=new AbortController,t=setTimeout(()=>i.abort(),a);try{const n=await fetch(e,{signal:i.signal,headers:{Accept:"application/json","User-Agent":"WeatherApp/1.0"}});return clearTimeout(t),n}catch(n){throw clearTimeout(t),n instanceof Error&&n.name==="AbortError"?new l(408,"Request timeout"):n}}createApiError(e){if(e instanceof l)return e;if(e instanceof TypeError&&e.message.includes("fetch"))return new l(0,"Error de conexión. Verifica tu conexión a internet.");const a=e?.message||"Error desconocido al obtener datos del clima",i=e?.code||e?.status||500;return new l(i,a,e)}isCacheValid(e){return Date.now()-e<this.CACHE_DURATION}delay(e){return new Promise(a=>setTimeout(a,e))}clearCache(){this.cache.clear(),console.log("🧹 Caché limpiado")}getCacheStats(){const e=Date.now(),a=Array.from(this.cache.entries()).map(([i,t])=>({city:i,age:Math.round((e-t.timestamp)/1e3)}));return{size:this.cache.size,entries:a}}updateConfig(e){this.config={...this.config,...e},console.log("⚙️ Configuración actualizada",this.config)}getDefaultCities(){return[...this.config.defaultCities]}}const T=new D;let u=[];const g=4;let c,C,w,y,p;const I=(s,e)=>{const a=s.toLowerCase();return a.includes("sunny")||a.includes("clear")?e?"☀️":"🌙":a.includes("partly cloudy")||a.includes("partial")?e?"⛅":"🌙":a.includes("cloudy")||a.includes("overcast")?"☁️":a.includes("rain")||a.includes("drizzle")?"🌧️":a.includes("thunder")||a.includes("storm")?"⛈️":a.includes("snow")||a.includes("blizzard")?"❄️":a.includes("fog")||a.includes("mist")?"🌫️":a.includes("wind")?"💨":e?"🌤️":"🌙"};async function $(){console.log("🌤️ Iniciando Weather Dashboard...");const s=document.getElementById("app");s.innerHTML=`
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
  `,c=document.getElementById("cityInput"),C=document.getElementById("addCityBtn"),w=document.getElementById("weatherGrid"),y=document.getElementById("loading"),p=document.getElementById("errorMessage"),C.addEventListener("click",v),c.addEventListener("keypress",a=>{a.key==="Enter"&&v()}),M();const e=["Madrid","New York","London","Tokyo"];for(const a of e)u.length<g&&(await A(a),await new Promise(i=>setTimeout(i,300)))}function M(){const s=["Madrid","Barcelona","Valencia","Sevilla","Bilbao","New York","Los Angeles","Chicago","Miami","San Francisco","London","Paris","Berlin","Rome","Amsterdam","Tokyo","Beijing","Seoul","Sydney","Mumbai","Buenos Aires","São Paulo","Mexico City","Lima","Cairo","Lagos","Cape Town","Nairobi"];let e=-1;c.addEventListener("input",function(){const n=this.value;if(t(),!n)return;e=-1;const r=document.createElement("div");r.setAttribute("id","autocomplete-list"),r.setAttribute("class","autocomplete-items"),this.parentNode.appendChild(r),s.filter(o=>o.toLowerCase().includes(n.toLowerCase())).slice(0,5).forEach(o=>{const h=document.createElement("div"),f=o.toLowerCase().indexOf(n.toLowerCase());h.innerHTML=o.substr(0,f)+"<strong>"+o.substr(f,n.length)+"</strong>"+o.substr(f+n.length),h.addEventListener("click",function(){c.value=o,t(),v()}),r.appendChild(h)})}),c.addEventListener("keydown",function(n){const r=document.getElementById("autocomplete-list");if(!r)return;const m=r.getElementsByTagName("div");n.keyCode===40?(e++,a(m)):n.keyCode===38?(e--,a(m)):n.keyCode===13&&(n.preventDefault(),e>-1&&m[e]&&m[e].click())});function a(n){n&&(i(n),e>=n.length&&(e=0),e<0&&(e=n.length-1),n[e].classList.add("autocomplete-active"))}function i(n){Array.from(n).forEach(r=>r.classList.remove("autocomplete-active"))}function t(){const n=document.getElementsByClassName("autocomplete-items");Array.from(n).forEach(r=>r.remove())}document.addEventListener("click",function(){t()})}async function v(){const s=c.value.trim();if(!s){d("Por favor ingresa el nombre de una ciudad");return}if(u.length>=g){d(`Máximo ${g} ciudades permitidas`);return}if(u.some(e=>e.name.toLowerCase()===s.toLowerCase())){d("Esta ciudad ya está agregada");return}await A(s),c.value=""}async function A(s){E(!0);try{const e=await T.getWeatherData(s);u.push(e),k(e),d("")}catch(e){console.error("Error cargando datos del clima:",e),d(`No se pudo cargar el clima para "${s}". Verifica el nombre de la ciudad.`)}finally{E(!1)}}function k(s){const e=document.createElement("div");e.className="weather-card",e.setAttribute("data-city",s.name);const a=I(s.condition,s.isDay);e.innerHTML=`
    <div class="city-header">
      <h2 class="city-name">${s.name}</h2>
      <span class="country">${s.country}</span>
      <button class="remove-btn" onclick="removeCity('${s.name}')" title="Eliminar ciudad">
        <span class="remove-icon">×</span>
      </button>
    </div>
    
    <div class="weather-main">
      <div class="temperature-display">
        <span class="temperature">${Math.round(s.temperature)}°C</span>
        <span class="feels-like">Sensación térmica: ${Math.round(s.feelsLike)}°C</span>
      </div>
      <div class="weather-icon-container">
        <span class="weather-icon">${a}</span>
      </div>
    </div>
    
    <div class="weather-condition">${s.condition}</div>
    
    <div class="weather-details">
      <div class="detail-item">
        <span class="detail-icon">💧</span>
        <div class="detail-content">
          <span class="detail-label">HUMEDAD</span>
          <span class="detail-value">${s.humidity}%</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">💨</span>
        <div class="detail-content">
          <span class="detail-label">VIENTO</span>
          <span class="detail-value">${s.windSpeed} km/h</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">🌡️</span>
        <div class="detail-content">
          <span class="detail-label">PRESIÓN</span>
          <span class="detail-value">${s.pressure} mb</span>
        </div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">☀️</span>
        <div class="detail-content">
          <span class="detail-label">UV INDEX</span>
          <span class="detail-value">${s.uvIndex}</span>
        </div>
      </div>
      
      <div class="detail-item full-width">
        <span class="detail-icon">🌅</span>
        <div class="detail-content">
          <span class="detail-label">AMANECER</span>
          <span class="detail-value">${s.sunrise}</span>
        </div>
      </div>
      
      <div class="detail-item full-width">
        <span class="detail-icon">🌇</span>
        <div class="detail-content">
          <span class="detail-label">ATARDECER</span>
          <span class="detail-value">${s.sunset}</span>
        </div>
      </div>
    </div>
    
    <div class="last-updated">
      Última actualización: ${new Date(s.lastUpdated).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}
    </div>
  `,e.style.opacity="0",e.style.transform="translateY(20px)",w.appendChild(e),requestAnimationFrame(()=>{e.style.transition="all 0.5s ease",e.style.opacity="1",e.style.transform="translateY(0)"})}window.removeCity=function(s){const e=document.querySelector(`[data-city="${s}"]`);e&&(e.style.transition="all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",e.style.transform="translateY(-20px) scale(0.8)",e.style.opacity="0",e.style.filter="blur(5px)",e.style.pointerEvents="none",setTimeout(()=>{u=u.filter(i=>i.name!==s),e.remove(),w.querySelectorAll(".weather-card").forEach((i,t)=>{const n=i;n.style.transition="all 0.4s ease",n.style.animationDelay=`${t*.1}s`})},600))};function E(s){y&&(y.style.display=s?"block":"none")}function d(s){p&&(p.textContent=s,p.style.display=s?"block":"none",s&&setTimeout(()=>{d("")},5e3))}async function b(){try{if(console.log("🌤️ Iniciando Weather Dashboard..."),!document.getElementById("app"))throw new Error("Container #app not found");await $(),console.log("✅ Weather Dashboard iniciado correctamente")}catch(s){console.error("❌ Error fatal:",s);const e=document.getElementById("app");e&&(e.innerHTML=`
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
            Error: ${s instanceof Error?s.message:"Unknown error"}
          </p>
        </div>
      `)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();
