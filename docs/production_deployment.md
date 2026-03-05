# Guía de Despliegue a Producción: SentinelFeedback 🌍

Esta guía detalla el proceso paso a paso para desplegar **SentinelFeedback** en entornos de nube profesionales. Utilizaremos **Render** para el Backend y **Vercel** para el Frontend, una combinación ideal para SaaS modernos.

---

## 🏗️ 1. Preparación del Repositorio

Asegúrate de que tu código esté subido a un repositorio de **GitHub** o **GitLab**. La estructura debe mantenerse:
- `/backend` (API Node.js)
- `/frontend` (React + Vite)
- `/supabase` (Scripts SQL)

---

## 🚀 2. Despliegue del Backend (Render)

El backend debe deplegarse primero para obtener la URL necesaria para el Frontend y el Webhook de Supabase.

1.  **Crear Web Service:** En el dashboard de [Render](https://render.com/), selecciona **New > Web Service**.
2.  **Conectar Repositorio:** Elige tu repositorio de GitHub.
3.  **Configuración del Servicio:**
    -   **Name:** `sentinel-feedback-backend`
    -   **Root Directory:** `backend`
    -   **Runtime:** `Node`
    -   **Build Command:** `npm install`
    -   **Start Command:** `npm start`
4.  **Variables de Entorno (Environment):** Añade las siguientes llaves:
    -   `PORT`: `3001` (o el que prefieras)
    -   `GEMINI_API_KEY`: Tu clave de Google AI Studio.
    -   `SUPABASE_URL`: URL del proyecto Supabase.
    -   `SUPABASE_SERVICE_ROLE_KEY`: Clave *service_role* (necesaria para guardar análisis saltando RLS).
5.  **Desplegar:** Render generará una URL similar a `https://sentinel-feedback-backend.onrender.com`. **Cópiala.**

---

## ⚡ 3. Configuración del Webhook en Supabase

Este paso conecta la base de datos con tu backend desplegado.

1.  Ve a **Supabase Dashboard > Database > Webhooks**.
2.  Crea un nuevo Webhook:
    -   **Name:** `analyze_sentiment_prod`
    -   **Table:** `answers`
    -   **Events:** `Insert`
    -   **URL:** `https://tu-backend.onrender.com/api/analyze-sentiment`
    -   **Headers:** `Content-Type: application/json`
3.  **Importante:** Verifica que el backend esté activo antes de probar.

---

## 🎨 4. Despliegue del Frontend (Vercel)

1.  **Crear Proyecto:** En [Vercel](https://vercel.com/), selecciona **Add New > Project**.
2.  **Importar Repositorio:** Selecciona el mismo repositorio.
3.  **Configuración del Proyecto:**
    -   **Framework Preset:** `Vite`
    -   **Root Directory:** `frontend`
4.  **Variables de Entorno:** Añade:
    -   `VITE_SUPABASE_URL`: URL de Supabase.
    -   `VITE_SUPABASE_ANON_KEY`: Clave *anon* de Supabase.
    -   `VITE_BACKEND_URL`: La URL de Render que copiaste en el paso 2 (ej. `https://tu-backend.onrender.com`).
4.  **Configuración de Rutas (vercel.json):**
    *   Asegúrate de que el archivo `frontend/vercel.json` esté presente para habilitar el enrutamiento client-side sin errores 404:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
5.  **Deploy:** Vercel te dará la URL final de tu aplicación (ej. `https://sentinel-feedback.vercel.app`).

---

## 🔍 5. Verificación Final en Producción

1.  Accede a la URL de Vercel.
2.  Crea una encuesta de prueba.
3.  Envía una respuesta con texto (ej. *"¡Excelente servicio, muy rápido!"*).
4.  Espera 2-5 segundos.
5.  Ve a la tabla `ai_analysis` en Supabase o al dashboard de resultados en tu App. Deberías ver el sentimiento **Positive** generado por la IA.

---

## 🛡️ 6. Recomendaciones de Seguridad

-   **CORS:** En `backend/src/index.js`, asegúrate de configurar el CORS para que solo acepte peticiones desde tu dominio de Vercel en producción.
-   **Logs:** Revisa los logs de Render si notas que los análisis no se guardan; suele ser por una URL de Webhook mal escrita o llaves de API incorrectas.

---
*Documento de entrega final - Equipo de Agentes de Antigravity.*
