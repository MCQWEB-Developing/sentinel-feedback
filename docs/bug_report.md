# Bug Report & Missing Features - SentinelFeedback MVP

## Detalle del Reporte (QA Agent)
Durante la Fase 5 de validación del MVP, se han identificado las siguientes incidencias o integraciones faltantes entre el desarrollo de las fases anteriores:

### 1. [Critico] Falta integración real Frontend-Backend
*   **Descripción:** El frontend actual (`CreateSurvey.jsx`) tiene la interfaz completa, pero la función `handleSave` solo imprime un `console.log`. No está conectado al backend local de Node.js mediante `$fetch` o `axios`.
*   **Reproducción:** Clic en "Guardar Encuesta".
*   **Asignado a:** Desarrollador Frontend (`frontend_agent`).

### 2. [Mayor] Autenticación Supabase en Frontend no implementada
*   **Descripción:** A nivel de Arquitectura (`architecture.md`), se especificó que Supabase manejaría Auth y RLS. El diseño incluye un botón "Cerrar Sesión", pero no hay lógica implementada (UI puramente representativa). 
*   **Asignado a:** Desarrollador Frontend / Backend.

### 3. [Menor] Refactor en Backend (Export de App)
*   **Descripción:** El archivo `index.js` del backend inicializa y hace *listen* del servidor en el mismo archivo. Para facilitar las pruebas unitarias (ej. con Supertest), el objeto `app` (Express) debería exportarse o separarse de la función `app.listen()`.
*   **Asignado a:** Desarrollador Backend (`backend_agent`).

## Conclusión QA
El UI y los endpoints principales existen de forma independiente. Para que el MVP esté completamente funcional, se debe conectar el ciclo completo:
`Frontend (React) -> Supabase Auth -> Backend (Express/Gemini) -> DB Supabase`.
