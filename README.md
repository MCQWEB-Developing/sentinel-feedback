# SentinelFeedback 🚀

**SentinelFeedback** es una plataforma SaaS moderna diseñada para revolucionar la recolección de feedback mediante el uso de Inteligencia Artificial. Permite crear encuestas personalizadas y utiliza modelos de lenguaje avanzados para analizar el sentimiento de cada respuesta en tiempo real.

---

## 🌟 Características Principales

- **Gestión de Encuestas:** Interfaz intuitiva para crear preguntas de texto libre, opción múltiple y escalas NPS.
- **Análisis de Sentimiento por IA:** Procesamiento automático de respuestas abiertas utilizando **Gemini AI** (`gemini-2.0-flash`).
- **Arquitectura Asíncrona:** Procesamiento resiliente basado en Webhooks de Base de Datos para garantizar un rendimiento óptimo.
- **Seguridad Robusta:** Implementación de Row Level Security (RLS) en Supabase para proteger los datos de los usuarios.
- **Contenedorización:** Listo para desplegar en cualquier entorno mediante Docker.

---

## 🏗️ Arquitectura Técnica

El sistema sigue una arquitectura de servicios desacoplados para máxima escalabilidad:

- **Frontend:** React + Vite + Tailwind CSS.
- **Backend:** Node.js (Express) para orquestación de IA.
- **Base de Datos & Autenticación:** Supabase (PostgreSQL).
- **Procesamiento de Lenguaje Natural:** Google Gemini API.

### Esquema de Datos (ERD)

El proyecto utiliza un modelo relacional que vincula encuestas, preguntas, respuestas y sus respectivos análisis de IA de forma íntegra. Consulta el detalle en `docs/architecture.md`.

---

## 📁 Estructura del Proyecto

```text
/sentinel-feedback
  ├── /backend          # API Node.js y lógica de integración con Gemini.
  ├── /frontend         # Aplicación React (SPA).
  ├── /supabase         # Esquemas SQL, políticas RLS y guías de Webhooks.
  ├── /docs             # Documentación técnica (PRD, Arquitectura, QA).
  └── docker-compose.yml # Orquestación local completa.
```

---

## 🚀 Instalación y Configuración Local

### Requisitos Previos
- Docker y Docker Compose (Recomendado).
- Node.js 20+ (para ejecución manual).
- Cuenta en Supabase y API Key de Gemini.

### Configuración de Variables de Entorno

Crea archivos `.env` en las carpetas respectivas basándote en los archivos `.env.example`:

**Backend (`backend/.env`):**
```env
PORT=3001
GEMINI_API_KEY=tu_clave_aqui
SUPABASE_URL=tu_url_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio
```

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_BACKEND_URL=http://localhost:3001
```

### Guía Detallada
Para un manual paso a paso que incluye la configuración de Supabase y Gemini, consulta la **[Guía de Despliegue Detallada](file:///d:/Projects/ia_agentes_02/sentinel-feedback/docs/deployment_guide.md)**.

Para instrucciones sobre cómo subir tu código a la nube por primera vez, consulta la **[Guía de Publicación en GitHub](file:///d:/Projects/ia_agentes_02/sentinel-feedback/docs/github_publishing_guide.md)**.

Para instrucciones específicas sobre cómo llevar el proyecto a la nube (Render + Vercel), consulta la **[Guía de Despliegue a Producción](file:///d:/Projects/ia_agentes_02/sentinel-feedback/docs/production_deployment.md)**.

### Ejecutar con Docker
```bash
docker-compose up --build
```

---

## 🛠️ Configuración de Webhooks (Análisis Automático)

Para habilitar el análisis de sentimiento automatizado, debes configurar un Webhook en tu proyecto de Supabase que apunte al endpoint del Backend:

1. Ve a **Database > Webhooks** en el panel de Supabase.
2. Dirección: `POST http://tu-api.com/api/analyze-sentiment`.
3. Evento: `INSERT` en la tabla `answers`.
4. Consulta el script detallado en `supabase/webhook_setup.sql`.

---

## 🧪 Calidad y Pruebas

El proyecto ha sido validado mediante una suite de pruebas de integración que cubren:
- Inserción de datos en tiempo real.
- Precisión de la clasificación de sentimientos de Gemini.
- Integridad de las políticas RLS.

Consulta el **Reporte de QA** en `docs/qa_report.md` para más información.

---

## 📄 Licencia
Este proyecto es propiedad del equipo de SentinelFeedback. 2026.
