import { initApp } from './modernWeatherApp';
import './styles/modern.scss';

/**
 * Punto de entrada de la aplicación
 */
async function main() {
  try {
    console.log('🌤️ Iniciando Weather Dashboard...');
    
    // Verificar que el contenedor existe
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('Container #app not found');
    }

    // Inicializar la aplicación moderna
    await initApp();
    
    console.log('✅ Weather Dashboard iniciado correctamente');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    
    // Mostrar error en la página
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
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
            Error: ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      `;
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
