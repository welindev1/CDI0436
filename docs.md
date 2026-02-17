# 📦 Guía de Despliegue — CDI0436

> **Stack:** NestJS (Backend) → Railway | Next.js (Frontend) → Vercel | PostgreSQL → Neon

---

## 🗂️ Orden de Despliegue

| # | Servicio | Plataforma | ¿Por qué este orden? |
|---|----------|-----------|----------------------|
| 1 | Base de datos | **Neon** | El backend necesita la URL de conexión |
| 2 | Backend API | **Railway** | El frontend necesita la URL de la API |
| 3 | Frontend | **Vercel** | Apunta al backend ya desplegado |
| 4 | Actualizar CORS | **Railway** | El backend necesita la URL final del frontend |

---

## 1️⃣ Base de Datos — Neon

### 1.1 Crear la base de datos

1. Ir a [neon.tech](https://neon.tech) y crear cuenta / iniciar sesión
2. Click en **"New Project"**
3. Configurar:
   - **Nombre:** `cdi0436`
   - **Región:** `US East 2 (Ohio)` (o la más cercana)
   - **PostgreSQL Version:** 15+
4. Click en **"Create Project"**

### 1.2 Obtener la URL de conexión

1. En el dashboard del proyecto, ir a **"Connection Details"**
2. Seleccionar **"Pooled connection"** ← Importante para producción
3. Copiar la connection string, se ve así:

```
postgresql://neondb_owner:TU_PASSWORD@ep-xxxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> [!IMPORTANT]
> Guarda esta URL, la necesitarás para Railway.

---

## 2️⃣ Backend — Railway

### 2.1 Preparar el repositorio

Asegúrate de que tu código está en GitHub. Si no lo has subido:

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/CDI0436.git
git push -u origin main
```

### 2.2 Crear el servicio en Railway

1. Ir a [railway.app](https://railway.app) e iniciar sesión con GitHub
2. Click en **"New Project"** → **"Deploy from GitHub repo"**
3. Seleccionar tu repositorio `CDI0436`
4. Railway detectará el monorepo. Configurar:
   - **Root Directory:** `backend`
   - Esto le dice a Railway que solo despliegue la carpeta `backend`

### 2.3 Configurar variables de entorno

En la pestaña **"Variables"** del servicio, agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:TU_PASSWORD@ep-xxxxx.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Una clave segura (ej: generar con `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `86400` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FRONTEND_URL` | *(dejar vacío por ahora, lo actualizamos en el paso 4)* |

### 2.4 Configurar el build

En **Settings** del servicio:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |

### 2.5 Desplegar

- Railway desplegará automáticamente al detectar los cambios
- Una vez desplegado, ir a **Settings → Networking → Generate Domain**
- Copiar la URL generada (ej: `https://cdi0436-production.up.railway.app`)

> [!IMPORTANT]
> Guarda esta URL, la necesitarás para Vercel.

### 2.6 Verificar

Abrir en el navegador:
```
https://TU-URL-RAILWAY.up.railway.app/apidocs
```
Si ves Swagger UI, ¡el backend está funcionando! ✅

---

## 3️⃣ Frontend — Vercel

### 3.1 Crear el proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub
2. Click en **"Add New..."** → **"Project"**
3. Importar el repositorio `CDI0436`
4. Configurar:
   - **Framework Preset:** Next.js (se auto-detecta)
   - **Root Directory:** `frontend`

### 3.2 Configurar variables de entorno

En la sección **"Environment Variables"**, agregar:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://TU-URL-RAILWAY.up.railway.app` |

> [!CAUTION]
> No pongas barra `/` al final de la URL.

### 3.3 Desplegar

- Click en **"Deploy"**
- Vercel construirá y desplegará automáticamente
- Una vez listo, copiar la URL del frontend (ej: `https://cdi0436.vercel.app`)

---

## 4️⃣ Actualizar CORS en Railway

Ahora que tienes la URL del frontend, volver a Railway:

1. Ir a las **Variables** del servicio backend
2. Actualizar `FRONTEND_URL` con la URL de Vercel:

```
FRONTEND_URL=https://cdi0436.vercel.app
```

3. Railway re-desplegará automáticamente

---

## ✅ Verificación Final

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Abrir `https://TU-BACKEND.up.railway.app/apidocs` | Swagger UI visible |
| 2 | Abrir `https://TU-FRONTEND.vercel.app` | Pantalla de login visible |
| 3 | Intentar login | Login exitoso, redirige al dashboard |
| 4 | Navegar el sistema | Datos cargan correctamente desde la API |

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Verificar que `DATABASE_URL` en Railway es correcta
- Verificar que el proyecto Neon está activo (no suspendido por inactividad)
- Asegurarse de que usas `?sslmode=require` al final

### "CORS error" en el frontend
- Verificar que `FRONTEND_URL` en Railway coincide **exactamente** con la URL de Vercel
- No debe tener `/` al final
- Después de cambiar, esperar que Railway re-despliegue

### "Build failed" en Railway
- Verificar que el **Root Directory** sea `backend`
- Verificar que `npm run build` funciona localmente:
  ```bash
  cd backend
  npm run build
  ```

### "Build failed" en Vercel
- Verificar que el **Root Directory** sea `frontend`
- Verificar que `npm run build` funciona localmente:
  ```bash
  cd frontend
  npm run build
  ```

### Neon se suspende (free tier)
- En el plan gratuito, Neon suspende la base de datos tras 5 minutos de inactividad
- La primera request después de suspensión puede tardar ~5 segundos (cold start)
- Para evitarlo, considera el plan de pago o un cron job de healthcheck

---

## 📁 Archivos de Referencia

| Archivo | Descripción |
|---------|-------------|
| `backend/.env.example` | Template de variables del backend |
| `frontend/.env.example` | Template de variables del frontend |
| `backend/Dockerfile` | Para despliegue con Docker (Railway lo soporta) |
| `.gitignore` | Archivos ignorados por Git |

---

## 🔐 Variables de Entorno — Resumen

### Backend (Railway)
```env
DATABASE_URL=postgresql://...@ep-xxxxx.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=tu-clave-secreta-generada
JWT_EXPIRES_IN=86400
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tu-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```
