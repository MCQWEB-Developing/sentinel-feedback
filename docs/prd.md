# Product Requirements Document (PRD): SentinelFeedback

## 1. Visión del Producto
**SentinelFeedback** es un SaaS (Software as a Service) diseñado para permitir a los usuarios crear, distribuir y analizar encuestas. El diferenciador principal (característica estrella) es que cada respuesta recibida será analizada automáticamente mediante Inteligencia Artificial para determinar el sentimiento del cliente, ofreciendo insights accionables y cualitativos inmediatos.

## 2. Objetivos Principales
* **Creación de Encuestas:** Plataforma intuitiva para diseñar encuestas con múltiples tipos de preguntas.
* **Recopilación de Respuestas:** Mecanismos para compartir encuestas y capturar las respuestas de los clientes.
* **Análisis de Sentimiento por IA:** Procesamiento de textos y respuestas abiertas para clasificar el sentimiento (Positivo, Negativo, Neutral, etc.) y extraer palabras clave.
* **Dashboard de Resultados:** Visualización de analíticas y sentimientos agregados de las campañas de encuestas.

## 3. Requerimientos Funcionales (MVP)

### 3.1. Gestión de Usuarios y Autenticación
* Registro e inicio de sesión de creadores de encuestas (cuentas SaaS).
* Gestión de perfiles básicos de los creadores.

### 3.2. Gestión de Encuestas
* CRUD (Crear, Leer, Actualizar, Borrar) de encuestas.
* Tipos de preguntas a soportar en el MVP: Texto libre (esenciales para el uso de IA), opción múltiple, escala NPS.
* Generación de enlace de encuestas público único para recolección de respuestas.

### 3.3. Recepción y Análisis por IA
* Almacenamiento estructurado de las respuestas recibidas de los usuarios finales.
* Integración con proveedor de IA (ej. Gemini, OpenAI) para analizar y clasificar el sentimiento en respuestas de texto libre.
* Asignación y almacenamiento del resultado de la IA (sentimiento, palabras clave) vinculado a cada respuesta específica.

### 3.4. Dashboard y Reportes
* Vista de resultados por encuesta, incluyendo métricas cuantitativas básicas (tasa de respuesta, NPS) y análisis cualitativos (distribución de sentimiento, nubes de conceptos recurrentes).

## 4. Requerimientos No Funcionales
* **Escalabilidad:** Diseño preparado para escalar ante volumen masivo de recepción de encuestas simultáneas.
* **Privacidad y Datos:** Medidas de seguridad altas para resguardar la información proporcionada por los encuestados y anonimizar datos sensibles antes de enviarlos a modelos de IA externos.
* **Rendimiento:** El análisis de IA debería funcionar preferiblemente mediante procesos asíncronos (background workers) para no degradar el tiempo de respuesta al participante de la encuesta que envía el formulario.

## 5. Stack Tecnológico Acordado
* **Frontend:** React agrupado con Vite.
* **Backend y Base de Datos:** Supabase (BaaS, Postgres).
* **Procesamiento de IA:** Gemini API.
