# QA Test Plan - SentinelFeedback

## 1. Alcance
Validar las funcionalidades core del MVP del SaaS de encuestas, centrándose particularmente en la capacidad de la IA (Gemini) de procesar las respuestas abiertas.

## 2. Entorno de Pruebas
*   **Frontend:** Localhost Vite Server (Desktop, navegadores Chromium).
*   **Backend:** Local Node.js / Express Server.
*   **DB:** Instancia local/cloud de Supabase con conexión API.

## 3. Casos de Prueba (Test Cases - Funcionales)

### TC-01: Creación de Encuesta con preguntas IA
1.  Iniciar sesión.
2.  Navegar a "Crear Encuesta".
3.  Añadir pregunta tipo "Texto Libre".
4.  Validar que el tag "IA Activa" sea visible.
5.  Guardar encuesta.
**Resultado esperado:** La encuesta y preguntas se introducen en Supabase con los IDs correctos respetando el RLS.

### TC-02: Envío de Respuesta Positiva
1.  Acceder a la URL pública de la encuesta creada.
2.  Contestar pregunta tipo "Texto Libre" con: *"El servicio fue insuperable, estoy realmente satisfecho y maravillado"*.
3.  Enviar.
**Resultado esperado:** El Webhook o el Endpoint intercepta la respuesta, invoca a Gemini y guarda el `sentiment` como 'Positive' con `confidence_score` > 0.8 en la tabla `ai_analysis`.

### TC-03: Envío de Respuesta Negativa
1.  Acceder a URL pública.
2.  Contestar "Texto Libre" con: *"Una completa pérdida de tiempo, el portal nunca cargó y perdí mis datos."*.
3.  Enviar.
**Resultado esperado:** Gemini lo clasifica como 'Negative' y extrae palabras clave como `["tiempo", "portal", "datos"]`.

## 4. Pruebas Automatizadas (Backend)
Se ha configurado una suite en Jest + Supertest para validar que el endpoint `/api/analyze-sentiment` responde correctamente a solicitudes bien formadas y rechaza peticiones sin cuerpo.
