# CDI0436 - Sistema de Gestión de Asistencias y Beneficiarios

## 📋 Descripción del Proyecto

CDI0436 es una aplicación web completa para la gestión integral de asistencias, beneficiarios, clases, horarios, tutores y reportes. Proporciona una solución moderna y escalable construida con tecnologías de punta para optimizar los procesos administrativos y académicos.

### ✨ Características Principales

- **Gestión de Asistencias**: Registrar, actualizar y justificar asistencias de forma individual o masiva
- **Administración de Beneficiarios**: Gestión completa de beneficiarios con información personal y académica
- **Gestión de Clases**: Crear y administrar clases, asignándolas a horarios y tutores
- **Gestión de Horarios**: Definir y organizar horarios académicos
- **Administración de Tutores**: Gestión de tutores y su asignación a clases
- **Gestión de Usuarios**: Control de acceso con roles y permisos diferenciados
- **Sistema de Reportes**: Generación de reportes en diferentes formatos (Excel, PDF)
- **Autenticación Segura**: Sistema de autenticación con JWT y roles
- **Validación de Datos**: Validación exhaustiva en cliente y servidor

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura de **monorepo** con dos aplicaciones principales:

```
CDI0436/
├── backend/          # NestJS API REST
├── frontend/         # Next.js aplicación web
└── docker-compose.yml # Orquestación de servicios
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **NestJS 11.x**: Framework de Node.js para aplicaciones escalables
- **TypeORM**: ORM para gestión de base de datos
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticación segura
- **Passport.js**: Estrategias de autenticación
- **Swagger**: Documentación de API automática
- **Jest**: Testing y cobertura de código
- **Prettier & ESLint**: Formateo y linting

### Frontend
- **Next.js 16.x**: Framework React con SSR
- **React 19.x**: Biblioteca de UI
- **Tailwind CSS 4.x**: Utilidades CSS
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de datos
- **Zustand**: State management
- **TanStack React Query**: Gestión de datos asincronos
- **Axios**: Cliente HTTP
- **TypeScript**: Tipado estático

### DevOps
- **Docker & Docker Compose**: Containerización y orquestación
- **PostgreSQL 15**: Base de datos

## 📋 Requisitos Previos

### Requisitos Mínimos
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Docker**: 20.x o superior
- **Docker Compose**: 1.29.x o superior
- **Git**: 2.x o superior

### Requisitos Opcionales
- **PostgreSQL**: 15.x (si ejecutas sin Docker)
- **Visual Studio Code**: Editor recomendado

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd CDI0436
```

### 2. Configurar Variables de Entorno

#### Backend (backend/.env)
```env
# Base de Datos
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=cdi0436

# JWT
JWT_SECRET=tu_secret_jwt_muy_seguro
JWT_EXPIRATION=3600

# API
API_PORT=3001
NODE_ENV=development
```

#### Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Opción A: Ejecutar con Docker Compose (Recomendado)

```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env

# Iniciar los servicios
docker-compose up -d

# El backend estará disponible en: http://localhost:3001
# El frontend estará disponible en: http://localhost:3000
```

### 3. Opción B: Ejecutar Localmente

#### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Ejecutar migraciones (si existen)
npm run migration:run

# Seed de usuarios (opcional)
npm run seed:users

# Modo desarrollo (con hot-reload)
npm run start:dev

# El servidor estará disponible en http://localhost:3001
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# El servidor estará disponible en http://localhost:3000
```

## 📦 Scripts Disponibles

### Backend

| Script | Descripción |
|--------|-------------|
| `npm run start` | Inicia la aplicación |
| `npm run start:dev` | Inicia en modo desarrollo con watch |
| `npm run start:debug` | Inicia con debug mode |
| `npm run start:prod` | Inicia en modo producción |
| `npm run build` | Compila el proyecto |
| `npm run lint` | Ejecuta linter y corrige errores |
| `npm run format` | Formatea el código con Prettier |
| `npm run test` | Ejecuta pruebas unitarias |
| `npm run test:watch` | Ejecuta pruebas en modo watch |
| `npm run test:cov` | Genera reporte de cobertura |
| `npm run test:e2e` | Ejecuta pruebas e2e |
| `npm run seed:users` | Carga datos iniciales de usuarios |

### Frontend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta linter |

## 📁 Estructura del Proyecto

### Backend

```
backend/
├── src/
│   ├── app.controller.ts          # Controlador principal
│   ├── app.module.ts              # Módulo raíz
│   ├── app.service.ts             # Servicio principal
│   ├── main.ts                    # Punto de entrada
│   └── scripts/
│       └── seed-users.ts          # Script para cargar datos iniciales
├── modules/                       # Módulos de funcionalidad
│   ├── asistencias/               # Gestión de asistencias
│   ├── auth/                      # Autenticación y autorización
│   ├── beneficiarios/             # Gestión de beneficiarios
│   ├── clases/                    # Gestión de clases
│   ├── horarios/                  # Gestión de horarios
│   ├── reportes/                  # Generación de reportes
│   ├── tutores/                   # Gestión de tutores
│   └── usuarios/                  # Gestión de usuarios
├── test/                          # Pruebas e2e
├── Dockerfile                     # Para producción
├── Dockerfile.dev                 # Para desarrollo
├── nest-cli.json                  # Configuración NestJS
├── tsconfig.json                  # Configuración TypeScript
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── app/                       # Aplicación principal (Next.js App Router)
│   │   ├── layout.tsx             # Layout raíz
│   │   ├── page.tsx               # Página principal
│   │   ├── dashboard/             # Sección dashboard
│   │   ├── login/                 # Página de login
│   │   └── register/              # Página de registro
│   ├── components/                # Componentes reutilizables
│   │   ├── asistencias/           # Componentes de asistencias
│   │   ├── auth/                  # Componentes de autenticación
│   │   ├── beneficiarios/         # Componentes de beneficiarios
│   │   ├── clases/                # Componentes de clases
│   │   ├── dashboard/             # Componentes del dashboard
│   │   ├── horarios/              # Componentes de horarios
│   │   ├── layout/                # Componentes de layout
│   │   ├── reportes/              # Componentes de reportes
│   │   ├── tutores/               # Componentes de tutores
│   │   └── ui/                    # Componentes UI base
│   ├── contexts/                  # Contextos de React
│   │   └── AuthContext.tsx        # Contexto de autenticación
│   ├── lib/                       # Utilidades y funciones helper
│   │   ├── api/                   # Cliente API
│   │   ├── hooks/                 # Custom hooks
│   │   ├── types/                 # Tipos TypeScript
│   │   └── utils/                 # Funciones de utilidad
│   └── store/                     # Estado global (Zustand)
├── public/                        # Archivos estáticos
├── next.config.ts                 # Configuración Next.js
└── tsconfig.json                  # Configuración TypeScript
```

## 🔐 Autenticación y Autorización

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación:

1. El usuario se registra o inicia sesión
2. El servidor retorna un JWT token
3. El cliente almacena el token (localStorage/cookie)
4. En cada solicitud, el token se envía en el header `Authorization: Bearer <token>`
5. El servidor valida el token y autoriza según el rol del usuario

### Roles Disponibles

- **ADMIN**: Acceso total al sistema
- **TUTOR**: Acceso a clases, beneficiarios y asistencias
- **BENEFICIARIO**: Acceso limitado a información personal

## 📊 Módulos Principales

### Asistencias
- Registrar asistencias individual o masiva
- Justificar ausencias
- Generar reportes de asistencia
- Filtrar por fecha, clase, beneficiario

### Beneficiarios
- CRUD completo de beneficiarios
- Asociación con clases y tutores
- Gestión de información personal

### Clases
- Crear y administrar clases
- Asignar horarios y tutores
- Gestionar beneficiarios por clase

### Horarios
- Definir bloques horarios
- Asignar a clases
- Gestionar disponibilidad

### Tutores
- Administración de tutores
- Asignación a clases
- Gestión de información

### Reportes
- Generación de reportes en Excel
- Exportación en PDF
- Filtros avanzados por período, beneficiario, clase

## 🧪 Testing

### Backend

```bash
# Ejecutar pruebas unitarias
npm run test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:cov

# Pruebas e2e
npm run test:e2e
```

## 🐛 Troubleshooting

### Puerto ya en uso
Si los puertos 3000, 3001 o 5432 ya están en uso:
```bash
# Cambiar puertos en docker-compose.yml
# O detener el servicio conflictivo
```

### Problemas de conexión a BD
```bash
# Verificar que PostgreSQL esté ejecutándose
docker ps

# Ver logs del contenedor
docker logs cdi_db
```

### Limpiar Docker
```bash
docker-compose down -v  # Elimina contenedores y volúmenes
docker system prune -a   # Limpia recursos no utilizados
```

## 🤝 Contribución

Para contribuir al proyecto:

1. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abre un Pull Request

### Estándares de Código
- Usar TypeScript
- Seguir las convenciones de NestJS y Next.js
- Ejecutar `npm run lint` y `npm run format` antes de hacer commit
- Escribir tests para nuevas funcionalidades
- Documentar código complejo

## 📚 Documentación Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Swagger API Documentation](http://localhost:3001/api/docs) (cuando el backend está ejecutándose)

## 📝 Licencia

Este proyecto está bajo la licencia **UNLICENSED**.

## 📞 Contacto y Soporte

Para reportar issues o solicitar features, abre un issue en el repositorio.

---

**Última actualización**: Diciembre 2025