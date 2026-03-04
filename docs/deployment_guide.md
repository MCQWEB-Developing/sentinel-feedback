# Manual de Despliegue: SentinelFeedback 🚀

Este manual contiene los pasos detallados para poner en marcha el proyecto **SentinelFeedback**, tanto en un entorno local como en un entorno de producción.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:
1. una cuenta en [Supabase](https://supabase.com/).
2. una llave de API de [Google AI Studio (Gemini)](https://aistudio.google.com/).
3. Docker y Docker Compose instalados (para despliegue en contenedores).
4. Node.js 20+ (si prefieres ejecución manual).

---

## 🛠️ Paso 1: Configuración de Supabase

### 1.1. Crear Proyecto
Crea un nuevo proyecto en Supabase y guarda tu **URL** y **Anon Key**.

### 1.2. Base de Datos
Ve a la sección **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`. Esto creará todas las tablas necesarias (`surveys`, `questions`, `responses`, `answers`, e `ai_analysis`) junto con sus políticas de seguridad (RLS).

### 1.3. Configurar Webhook (Crucial para la IA)
Para que el análisis de sentimiento sea automático y resiliente:
1. Ve a **Database > Webhooks**.
2. Haz clic en **Create a new webhook**.
3. **Name:** `analyze_sentiment`.
4. **Table:** `answers`.
5. **Events:** `Insert`.
6. **Method:** `POST`.
7. **URL:** `http://TU_URL_DEL_BACKEND/api/analyze-sentiment`.
8. **HTTP Headers:** Añade `Content-Type: application/json`.
9. Consulta `supabase/webhook_setup.sql` para ver la lógica técnica detallada.

---

## 🔑 Paso 2: Configuración de Variables de Entorno

Debes configurar los archivos `.env` en las carpetas correspondientes.

### Backend (`backend/.env`)
```env
PORT=3001
GEMINI_API_KEY=tu_clave_de_google_ai_studio
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key (Necesaria para bypass de RLS al guardar análisis)
```

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima
VITE_BACKEND_URL=http://localhost:3001 (En producción será la URL del backend desplegado)
```

---

## 📦 Paso 3: Despliegue Local (Docker)

La forma más rápida de ejecutar todo el stack es usando Docker Compose:

```bash
# Desde la raíz del proyecto
docker-compose up --build
```
Esto levantará:
- **Frontend:** Accesible en [http://localhost](http://localhost) (Puerto 80).
- **Backend:** Accesible en [http://localhost:3001](http://localhost:3001).

---

## 🌍 Paso 4: Despliegue a Producción (Recomendado)

### 4.1. Frontend (Vercel, Netlify o GitHub Pages)
1. Conecta tu repositorio.
2. Configura el comando de build: `npm run build`.
3. Directorio de salida: `dist`.
4. Añade las variables de entorno de `VITE_*`.

### 4.2. Backend (Render, Railway o AWS)
1. Despliega la carpeta `/backend`.
2. Asegúrate de configurar la variable `PORT` y las demás llaves del backend.
3. El backend **debe ser accesible públicamente** para que el Webhook de Supabase pueda enviarle peticiones.

---

## 🧪 Paso 5: Verificando el Despliegue

1. Entra a tu aplicación frontend.
2. Crea una encuesta con una pregunta de tipo "Texto Libre".
3. Ve a la encuesta pública y responde algo como: *"El servicio es nefasto"*.
4. Ve al Dashboard o revisa la tabla `ai_analysis` en Supabase.
5. Deberías ver el registro analizado por la IA automáticamente en unos segundos.

---

## 🆘 Solución de Problemas

- **La IA no analiza:** Verifica que tu `GEMINI_API_KEY` sea válida y que el Webhook de Supabase esté apuntando a la dirección correcta del Backend.
- **Error de RLS:** Asegúrate de que el Backend use la `SERVICE_ROLE_KEY`, ya que es el único que puede escribir en la tabla `ai_analysis`.

---
*Manual generado por el Equipo de Agentes Antigravity.*
