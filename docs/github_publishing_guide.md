# Guía de Publicación en GitHub 🐙

Esta guía detalla los pasos para inicializar tu repositorio local y subir el proyecto **SentinelFeedback** a GitHub por primera vez.

---

## 1. Preparación del Repositorio Local

Antes de subir el código, asegúrate de estar en la raíz del proyecto (`ia_agentes_02/sentinel-feedback`).

### 1.1. Inicializar Git
```bash
git init
```

### 1.2. Configurar Archivos a Ignorar (.gitignore)
Asegúrate de tener un archivo `.gitignore` en la raíz para evitar subir información sensible o carpetas pesadas. Si no lo tienes, créalo con este contenido mínimo:
```text
node_modules/
.env
dist/
.DS_Store
```

### 1.3. Primer Commit
```bash
git add .
git commit -m "Initial commit: SentinelFeedback MVP with AI Integration"
```

---

## 2. Crear Repositorio en GitHub

1. Entra a tu cuenta de [GitHub](https://github.com/).
2. Haz clic en el botón **New** para crear un nuevo repositorio.
3. **Repository name:** `sentinel-feedback` (o el de tu preferencia).
4. Elige si será **Public** o **Private**.
5. **No** inicialices con README, License o .gitignore (ya los tenemos).
6. Haz clic en **Create repository**.

---

## 3. Vincular y Subir Código

Copia los comandos que te proporciona GitHub o usa los siguientes (reemplazando con tu URL):

```bash
# Cambiar el nombre de la rama principal a main
git branch -M main

# Vincular el repositorio remoto (REEMPLAZA LA URL)
git remote add origin https://github.com/TU_USUARIO/sentinel-feedback.git

# Subir el código por primera vez
git push -u origin main
```

---

## 4. Mejores Prácticas para el SaaS

- **No subas los .env:** Nunca compartas tus API Keys. Los agentes ya han configurado `.env.example` para que otros sepan qué variables necesitan.
- **Ramas (Branches):** Si trabajas en equipo o vas a hacer cambios grandes (ej. Fase 7 de resiliencia), crea una rama nueva:
  ```bash
  git checkout -b feature/resiliencia-webhooks
  ```
- **Pull Requests:** Una vez que tu código esté en GitHub, usa Pull Requests para fusionar cambios a `main`.

---
*Documento de entrega final - Equipo de Agentes de Antigravity.*
