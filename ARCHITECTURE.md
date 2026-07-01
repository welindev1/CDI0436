# System Architecture

## 📐 Overview

CDI0436 is a full-stack web application built with a **monorepo** structure, containing two main applications:

- **Backend**: NestJS 11 REST API with TypeORM + PostgreSQL
- **Frontend**: Next.js 16 with App Router, Tailwind CSS 4, and React 19

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Next.js 16 App Router                   │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────────┐ │ │
│  │  │  Pages   │ │Components│ │  API Client (Axios)  │ │ │
│  │  └─────────┘ └──────────┘ └──────────┬───────────┘ │ │
│  │  ┌─────────┐ ┌──────────┐            │             │ │
│  │  │Contexts │ │  Utils   │            │             │ │
│  │  └─────────┘ └──────────┘            │             │ │
│  └──────────────────────────────────────┼──────────────┘ │
└─────────────────────────────────────────┼────────────────┘
                                          │ HTTPS / JSON / JWT
                                          ▼
┌─────────────────────────────────────────────────────────┐
│                 NestJS 11 API REST                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐ │
│  │ Auth     │ │ Modules  │ │  Common                   │ │
│  │ (JWT)    │ │ (13)     │ │  - Filters               │ │
│  │ Passport │ │          │ │  - Guards (Throttle)     │ │
│  │ Guards   │ │          │ │  - Pipes (Validation)    │ │
│  └──────────┘ └────┬─────┘ └──────────────────────────┘ │
│                    │                                      │
│                    ▼                                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              TypeORM + PostgreSQL 15                 │ │
│  │  Entities: 19 │ Migrations │ SSL (producción)       │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Folder Structure

### Backend (`backend/`) — NestJS 11

```
backend/
├── src/
│   ├── main.ts                    # Bootstrap: CORS, security headers, Swagger, static files
│   ├── app.module.ts              # Root module: imports ConfigModule, TypeORM, all feature modules
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   ├── common/                    # Shared cross-cutting concerns
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts    # Global exception filter (logs errors)
│   │   ├── guards/
│   │   │   └── throttle.guard.ts           # In-memory rate limiting (60 req/min)
│   │   └── pipes/
│   │       └── validation.pipe.ts          # Custom validation pipe using class-validator
│   ├── modules/                   # Feature modules (13 total)
│   │   ├── auth/                  # Authentication & authorization
│   │   │   ├── auth.module.ts     # Configures JwtModule, PassportModule
│   │   │   ├── auth.controller.ts # POST /auth/login, GET /auth/me, GET /auth/validate
│   │   │   ├── auth.service.ts    # Login logic, token validation
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts       # Passport JWT strategy
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts      # JWT verification, supports @Public()
│   │   │   │   └── permisos.guard.ts      # Permission check against required codes
│   │   │   ├── decorators/
│   │   │   │   ├── public.decorator.ts    # @Public() - skips JWT auth
│   │   │   │   ├── current-user.decorator.ts  # @CurrentUser() - extracts user from request
│   │   │   │   └── permisos.decorator.ts  # @RequierePermiso() - specifies required permissions
│   │   │   └── dto/
│   │   │       └── login.dto.ts
│   │   ├── usuarios/              # User management
│   │   │   ├── usuario.entity.ts  # Entity: id, nombre, correo, password_hash, rol, activo, primer_login
│   │   │   ├── usuarios.module.ts
│   │   │   ├── usuarios.controller.ts  # CRUD + /:id/cambiar-password + /:id/reset-password
│   │   │   ├── usuarios.service.ts     # CRUD with bcrypt hashing, password validation
│   │   │   └── dto/
│   │   ├── roles/                 # Role-based access control (RBAC)
│   │   │   ├── entities/
│   │   │   │   ├── rol.entity.ts      # Rol: nombre, descripcion, es_super_admin, activo, permisos[]
│   │   │   │   └── permiso.entity.ts  # Permiso: codigo, nombre, modulo, accion, descripcion
│   │   │   ├── roles.module.ts
│   │   │   ├── roles.controller.ts     # CRUD + /:id/permisos
│   │   │   ├── roles.service.ts        # CRUD with permission assignment
│   │   │   ├── permisos.service.ts     # Permission listing and grouping by module
│   │   │   └── dto/
│   │   ├── asistencias/           # Attendance management
│   │   │   ├── asistencia.entity.ts    # Entity with unique index on (clase, beneficiario, fecha)
│   │   │   ├── foto-asistencia.entity.ts # Photo entity for attendance
│   │   │   ├── asistencias.module.ts
│   │   │   ├── asistencias.controller.ts # CRUD + masiva, marcar-todos, justificar-masivo, reportes, fotos
│   │   │   ├── asistencias.service.ts    # Business logic with duplicate detection
│   │   │   └── dto/                   # CreateAsistenciaDto, FilterAsistenciaDto, etc.
│   │   ├── beneficiarios/         # Beneficiary management
│   │   │   ├── beneficiario.entity.ts   # Entity with relations to clases, supervivencias
│   │   │   ├── beneficiario-expediente.entity.ts
│   │   │   ├── beneficiarios.module.ts
│   │   │   ├── beneficiarios.controller.ts # CRUD + importar, exportar, expedientes, cumpleaños
│   │   │   ├── beneficiarios.service.ts    # CRUD, Excel import/export, aging calculation
│   │   │   └── dto/
│   │   ├── clases/                # Class management
│   │   │   ├── clase.entity.ts    # Entity with relations to tutor, horarios, beneficiarios
│   │   │   ├── clases.module.ts
│   │   │   ├── clases.controller.ts  # CRUD + /:id/beneficiarios
│   │   │   ├── clases.service.ts     # CRUD logic
│   │   │   └── dto/
│   │   ├── horarios/              # Schedule management
│   │   │   ├── horario.entity.ts  # Entity with dia (enum), hora_inicio, hora_fin
│   │   │   ├── horarios.module.ts
│   │   │   ├── horarios.controller.ts  # CRUD + /disponibles
│   │   │   ├── horarios.service.ts
│   │   │   └── dto/
│   │   ├── tutores/               # Tutor management
│   │   │   ├── tutor.entity.ts
│   │   │   ├── tutores.module.ts
│   │   │   ├── tutores.controller.ts
│   │   │   ├── tutores.service.ts
│   │   │   └── dto/
│   │   ├── ayudas/                # Aid/support requests
│   │   │   ├── ayuda.entity.ts    # Entity with tipo (enum), estado (enum), fotos
│   │   │   ├── comentario-ayuda.entity.ts  # Comments on aid requests
│   │   │   ├── ayudas.module.ts
│   │   │   ├── ayudas.controller.ts    # CRUD + /:id/estado, /:id/comentarios, /:id/foto-entrega
│   │   │   ├── ayudas.service.ts       # Business logic
│   │   │   ├── webhook.service.ts      # External webhook integration
│   │   │   ├── whatsapp.service.ts     # WhatsApp integration
│   │   │   └── dto/
│   │   ├── supervivencias/        # Survival course (extracurricular)
│   │   │   ├── supervivencia.entity.ts # Entity with tutor, beneficiarios
│   │   │   ├── asistencia-supervivencia.entity.ts
│   │   │   ├── foto-asistencia-supervivencia.entity.ts
│   │   │   ├── supervivencias.module.ts
│   │   │   ├── supervivencias.controller.ts # CRUD + asistencias, fotos, historial
│   │   │   ├── supervivencias.service.ts
│   │   │   └── dto/
│   │   ├── nutricion/             # Nutrition module
│   │   │   ├── menu-nutricion.entity.ts # Entity with fecha, tanda (enum), titulo
│   │   │   ├── nutricion.module.ts
│   │   │   ├── nutricion.controller.ts  # CRUD by month, by date+tanda
│   │   │   ├── nutricion.service.ts
│   │   │   └── dto/
│   │   ├── merito/                # Academic merit/scholarship
│   │   │   ├── periodo-merito.entity.ts  # Academic period
│   │   │   ├── nota-merito.entity.ts     # Grades for math, language, science, social studies
│   │   │   ├── merito.module.ts
│   │   │   ├── merito.controller.ts  # Periodos, notas, dashboard, ganadores
│   │   │   ├── merito.service.ts     # Grade calculation, winner selection
│   │   │   └── dto/
│   │   └── reportes/              # Reports
│   │       ├── reporte.entity.ts
│   │       └── reportes.controller.ts
│   └── scripts/
│       └── seed-users.ts          # Seed command for initial users
├── test/                          # E2E tests (Jest + Supertest)
├── Dockerfile                     # Production multi-stage (Node 20 Alpine)
├── Dockerfile.dev                 # Dev with hot-reload
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Frontend (`frontend/`) — Next.js 16

```
frontend/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout: Inter font, AuthProvider
│   │   ├── page.tsx               # Login page (default route)
│   │   ├── globals.css            # Tailwind CSS v4 directives
│   │   ├── login/page.tsx         # Alternative login page
│   │   ├── register/page.tsx      # Registration page
│   │   ├── ayudas/page.tsx        # Public aid requests page
│   │   └── dashboard/             # Protected dashboard section
│   │       ├── layout.tsx         # DashboardLayout + Sidebar + Header
│   │       ├── page.tsx           # Dashboard home with stats
│   │       ├── asistencias/       # Attendance pages
│   │       ├── ayudas/            # Aid management pages
│   │       ├── beneficiarios/     # Beneficiary management pages
│   │       ├── bonos/             # Bonds pages
│   │       ├── clases/            # Class management pages
│   │       ├── cumpleanos/        # Birthday pages
│   │       ├── horarios/          # Schedule pages
│   │       ├── merito/            # Academic merit pages
│   │       ├── nutricion/         # Nutrition pages
│   │       ├── reportes/          # Report pages
│   │       ├── roles/             # Role management pages
│   │       ├── supervivencia/     # Survival course pages
│   │       ├── tutores/           # Tutor management pages
│   │       └── usuarios/          # User management pages
│   ├── components/                # Reusable React components
│   │   ├── ui/                    # Base UI components
│   │   │   ├── Alert.tsx          # Success/Error/Warning/Info variants
│   │   │   ├── Button.tsx         # Primary/Secondary/Outline/Ghost/Danger variants
│   │   │   ├── Input.tsx          # Text input with label and error state
│   │   │   ├── Modal.tsx          # Animated modal with sizes (sm/md/lg/xl)
│   │   │   ├── Select.tsx         # Dropdown with label and error state
│   │   │   ├── Table.tsx          # Table component with head/body/row/cell
│   │   │   └── Loading.tsx        # Loading spinner
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx # Sidebar + Header + main content wrapper
│   │   │   ├── Sidebar.tsx        # Responsive sidebar with menu groups and permissions
│   │   │   └── Header.tsx         # Top header with user info
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.tsx  # Route guard based on auth state
│   │   │   └── PrimerLoginModal.tsx # Password change modal for first login
│   │   ├── asistencias/
│   │   │   ├── RegistroAsistencia.tsx  # Visual attendance register
│   │   │   ├── EstadoBadge.tsx         # Status badge component
│   │   │   └── ClaseFechaSelector.tsx  # Class + date selector
│   │   ├── beneficiarios/
│   │   │   ├── BeneficiarioForm.tsx    # Beneficiary form (create/edit)
│   │   │   ├── ImportarExcelModal.tsx  # Excel import modal
│   │   │   ├── AgregarExpedienteModal.tsx
│   │   │   ├── EditarExpedienteModal.tsx
│   │   │   ├── EditarPerfilModal.tsx
│   │   │   └── BeneficiarioFolder.tsx
│   │   ├── dashboard/
│   │   │   └── StatCard.tsx       # Dashboard statistics card
│   │   ├── supervivencia/
│   │   │   ├── SupervivenciaForm.tsx
│   │   │   └── AgregarBeneficiariosSupervivenciaModal.tsx
│   │   ├── clases/
│   │   ├── horarios/
│   │   ├── reportes/
│   │   └── tutores/
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state management (login, logout, permissions)
│   └── lib/
│       ├── api/                   # API client modules
│       │   ├── client.ts          # Axios instance with JWT interceptor + 401 handling
│       │   ├── auth.ts            # login, register, getProfile, validateToken
│       │   ├── asistencias.ts     # Attendance API methods
│       │   ├── beneficiarios.ts   # Beneficiary API methods
│       │   ├── clases.ts          # Class API methods
│       │   ├── tutores.ts         # Tutor API methods
│       │   ├── horarios.ts        # Schedule API methods
│       │   ├── usuarios.ts        # User API methods
│       │   ├── ayudas.ts          # Aid API methods
│       │   ├── supervivencias.ts  # Survival course API methods
│       │   ├── nutricion.ts       # Nutrition API methods
│       │   ├── merito.ts          # Academic merit API methods
│       │   ├── roles.ts           # Role/Permission API methods
│       │   └── dashboard.ts       # Dashboard API methods
│       ├── types/
│       │   └── index.ts           # TypeScript interfaces and enums
│       └── utils/
│           ├── cn.ts              # className merger (clsx + tailwind-merge)
│           ├── exportExcel.ts     # Excel export utility
│           └── exportPDF.ts       # PDF export utility
├── public/
│   └── logo.svg                   # Application logo
├── next.config.ts                 # standalone output
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

## 🔐 Authentication & Authorization Flow

### Login Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Backend │         │    DB    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │  POST /auth/login  │                     │
     │  {correo,password} │                     │
     │───────────────────>│                     │
     │                    │                     │
     │                    │  findByCorreo()     │
     │                    │────────────────────>│
     │                    │<────────────────────│
     │                    │   usuario (hashed)  │
     │                    │                     │
     │                    │  bcrypt.compare()   │
     │                    │                     │
     │                    │  JWT.sign(payload)  │
     │                    │                     │
     │  {access_token,    │                     │
     │   usuario}         │                     │
     │<───────────────────│                     │
     │                    │                     │
     │  Store token:      │                     │
     │  localStorage OR   │                     │
     │  sessionStorage    │                     │
     │                    │                     │
```

### JWT Token Structure

```json
{
  "sub": "uuid-user-id",
  "correo": "user@example.com",
  "nombre": "John Doe",
  "rol_id": "uuid-role-id",
  "iat": 1680000000,
  "exp": 1680086400
}
```

### Request Authorization Flow

```
┌──────────┐         ┌──────────────┐        ┌──────────────┐       ┌──────────┐
│  Client  │         │JwtAuthGuard  │        │PermisosGuard  │       │Controller│
└────┬─────┘         └──────┬───────┘        └──────┬────────┘       └────┬─────┘
     │                      │                       │                     │
     │  GET /api/resource   │                       │                     │
     │  Authorization:      │                       │                     │
     │  Bearer <token>      │                       │                     │
     │─────────────────────>│                       │                     │
     │                      │                       │                     │
     │                      │  Is @Public()?        │                     │
     │                      │  Yes → skip           │                     │
     │                      │  No  → verify JWT     │                     │
     │                      │                       │                     │
     │                      │  Extract payload      │                     │
     │                      │  Find user in DB      │                     │
     │                      │  Check user.active    │                     │
     │                      │                       │                     │
     │                      │  Attach user to req   │                     │
     │                      │──────────────────────>│                     │
     │                      │                       │                     │
     │                      │                       │  Has @Requiere-    │
     │                      │                       │  Permiso()?        │
     │                      │                       │  No → allow        │
     │                      │                       │  Yes → check       │
     │                      │                       │  user.rol.permisos │
     │                      │                       │                     │
     │                      │                       │  es_super_admin?   │
     │                      │                       │  Yes → allow all   │
     │                      │                       │  No → check codes  │
     │                      │                       │                     │
     │                      │                       │────────────────────>│
     │                      │                       │                     │
     │<─────────────────────────────────────────────│──── Response ──────│
```

### Permission Check Logic

```typescript
// permisos.guard.ts
canActivate(context): boolean {
  const requiredPermisos = reflector.get(PERMISOS_KEY);
  if (!requiredPermisos || requiredPermisos.length === 0) return true;
  
  const { user } = context.switchToHttp().getRequest();
  if (!user || !user.rol) return false;
  
  // Super admin bypass
  if (user.rol.es_super_admin) return true;
  
  // Check if user has ANY of the required permissions
  const userPermisos = user.rol.permisos.map(p => p.codigo);
  return requiredPermisos.some(p => userPermisos.includes(p));
}
```

## 📊 Data Flow

### Creation Flow (Example: Register Attendance)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │     │  Controller  │     │   Service    │     │    DB    │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                     │                   │
     │  POST            │                     │                   │
     │  /asistencias    │                     │                   │
     │─────────────────>│                     │                   │
     │                  │                     │                   │
     │                  │  ValidationPipe     │                   │
     │                  │  (class-validator)  │                   │
     │                  │                     │                   │
     │                  │  create(dto)        │                   │
     │                  │────────────────────>│                   │
     │                  │                     │                   │
     │                  │                     │  Check clase      │
     │                  │                     │  exists + active  │
     │                  │                     │──────────────────>│
     │                  │                     │<──────────────────│
     │                  │                     │                   │
     │                  │                     │  Check benefici-  │
     │                  │                     │  ario + inscrito  │
     │                  │                     │──────────────────>│
     │                  │                     │<──────────────────│
     │                  │                     │                   │
     │                  │                     │  Check duplicate  │
     │                  │                     │  (clase + ben +   │
     │                  │                     │   fecha)         │
     │                  │                     │──────────────────>│
     │                  │                     │<──────────────────│
     │                  │                     │                   │
     │                  │                     │  Save Asistencia  │
     │                  │                     │──────────────────>│
     │                  │                     │<──────────────────│
     │                  │                     │                   │
     │                  │<────────────────────│                   │
     │                  │                     │                   │
     │<─────────────────│                     │                   │
     │  201 Created     │                     │                   │
```

## 🔗 Module Dependencies

```
                    ┌─────────────┐
                    │   AuthModule │
                    └──────┬──────┘
                           │ depends on
                           ▼
                    ┌─────────────┐
                    │UsuariosModule│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │RolesModule │ │AyudasModule│ │AuthModule  │
     │ (imported  │ │            │ │(re-exports)│
     │  first)    │ │            │ │            │
     └────────────┘ └────────────┘ └────────────┘
              │
              ▼
     ┌─────────────────────────────────────────────┐
     │    All other modules (independent)           │
     │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
     │  │Asistencias│ │Clases    │ │Beneficiarios │ │
     │  └──────────┘ └──────────┘ └──────────────┘ │
     │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
     │  │Horarios  │ │Tutores   │ │Supervivencias│ │
     │  └──────────┘ └──────────┘ └──────────────┘ │
     │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
     │  │Nutricion │ │Merito    │ │Reportes      │ │
     │  └──────────┘ └──────────┘ └──────────────┘ │
     └─────────────────────────────────────────────┘
```

### Entity Relationships

```
Usuario ──ManyToOne──> Rol ──ManyToMany──> Permiso
  │                        │
  │                   es_super_admin: boolean
  │
  ▼
Asistencia ──ManyToOne──> Clase ──ManyToOne──> Tutor
  │                       │                    │
  └──ManyToOne──> Beneficiario               │
                      │                      │
                      └──ManyToMany──> Clases │
                                         │    │
                      └──ManyToMany──> Horarios
                                         │
Supervivencia ──ManyToOne──> Tutor       │
  │                                       │
  └──ManyToMany──> Beneficiario          │
  │                                       │
AsistenciaSupervivencia ──ManyToOne──> Beneficiario
  │
  └──ManyToOne──> Supervivencia
```

## 🚢 Deployment Architecture

### Option 1: Docker Compose (Development/On-premise)

```
┌────────────────────────────────────────────────────┐
│                   Docker Host                        │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │   Frontend   │    │   Backend    │               │
│  │  :3000       │    │  :3001       │               │
│  │  Next.js 16  │    │  NestJS 11   │               │
│  └──────┬───────┘    └──────┬───────┘               │
│         │                   │                        │
│         └───────────────────┘                        │
│                         │                            │
│                         ▼                            │
│              ┌──────────────────┐                    │
│              │   PostgreSQL 15  │                    │
│              │   :5432          │                    │
│              │   Volume:        │                    │
│              │   postgres_data  │                    │
│              └──────────────────┘                    │
│                                                      │
│  Network: app-network (bridge)                      │
└──────────────────────────────────────────────────────┘
```

### Option 2: Production (Railway + Vercel)

```
┌──────────────┐     DNS     ┌──────────────┐
│  Vercel      │ <────────── │  Custom      │
│  Frontend    │             │  Domain      │
│  Next.js 16  │             └──────────────┘
└──────┬───────┘
       │ HTTPS / API Calls
       ▼
┌──────────────┐     SSL      ┌──────────────┐
│  Railway     │ <────────── │  Neon        │
│  Backend     │             │  PostgreSQL  │
│  NestJS 11   │             │  Serverless  │
└──────────────┘             └──────────────┘
```

### Environment Variables by Environment

| Variable | Local Dev | Docker | Production |
|----------|-----------|--------|------------|
| `DATABASE_URL` | Local PostgreSQL | Service `postgres` | Neon serverless |
| `JWT_SECRET` | Dev secret | Dev secret | Strong production secret |
| `JWT_EXPIRES_IN` | 86400 (24h) | 86400 | 86400 |
| `PORT` | 3001 | 3001 | Railway-assigned |
| `NODE_ENV` | development | development | production |
| `FRONTEND_URL` | http://localhost:3000 | http://localhost:3000 | https://app.tbccaminando.org |
| `NEXT_PUBLIC_API_URL` | http://localhost:3001 | http://localhost:3001 | https://api.tuapp.com |

## 🧩 API Design

### Base URL
- Development: `http://localhost:3001`
- Production: `https://api.tuapp.com`

### Authentication
All endpoints except `POST /auth/login` require:
```
Authorization: Bearer <jwt_token>
```

### Response Format

**Success:**
```json
{
  "id": "uuid",
  "nombre": "Data",
  ...
}
```

**Error (400/401/404/409):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "nombre", "messages": ["El nombre es requerido"] }
  ],
  "timestamp": "2026-06-28T12:00:00.000Z"
}
```

**Error (429 - Rate Limited):**
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "timestamp": "2026-06-28T12:00:00.000Z"
}
```

### Endpoints Summary

| Module | Method | Endpoint | Auth | Permissions |
|--------|--------|----------|------|-------------|
| Auth | POST | `/auth/login` | Public | - |
| Auth | GET | `/auth/me` | JWT | - |
| Auth | GET | `/auth/validate` | JWT | - |
| Usuarios | GET/POST | `/usuarios` | JWT | usuarios:ver / usuarios:crear |
| Usuarios | GET/PATCH/DELETE | `/usuarios/:id` | JWT | usuarios:ver / usuarios:editar / usuarios:eliminar |
| Usuarios | PATCH | `/usuarios/:id/cambiar-password` | JWT | - |
| Usuarios | PATCH | `/usuarios/:id/reset-password` | JWT | usuarios:editar |
| Roles | GET/POST | `/roles` | JWT | roles:ver / roles:crear |
| Roles | GET/PATCH/DELETE | `/roles/:id` | JWT | roles:ver / roles:editar / roles:eliminar |
| Roles | GET | `/roles/permisos` | JWT | roles:ver |
| Roles | GET | `/roles/permisos/agrupados` | JWT | roles:ver |
| Roles | PATCH | `/roles/:id/permisos` | JWT | roles:editar |
| Asistencias | GET/POST | `/asistencias` | JWT | asistencias:ver / asistencias:crear |
| Asistencias | POST | `/asistencias/masiva` | JWT | asistencias:crear |
| Asistencias | POST | `/asistencias/marcar-todos` | JWT | asistencias:crear |
| Asistencias | POST | `/asistencias/justificar-masivo` | JWT | asistencias:justificar |
| Asistencias | GET | `/asistencias/reporte/*` | JWT | asistencias:ver |
| Asistencias | POST | `/asistencias/foto` | JWT | asistencias:crear |
| Beneficiarios | GET/POST | `/beneficiarios` | JWT | beneficiarios:ver / beneficiarios:crear |
| Beneficiarios | GET/PATCH/DELETE | `/beneficiarios/:id` | JWT | beneficiarios:ver / beneficiarios:editar / beneficiarios:eliminar |
| Beneficiarios | POST | `/beneficiarios/importar` | JWT | beneficiarios:crear |
| Beneficiarios | GET | `/beneficiarios/buscar-publico` | JWT | - |
| Clases | GET/POST | `/clases` | JWT | clases:ver / clases:crear |
| Clases | GET/PATCH/DELETE | `/clases/:id` | JWT | clases:ver / clases:editar / clases:eliminar |
| Horarios | GET/POST | `/horarios` | JWT | horarios:ver / horarios:crear |
| Tutores | GET/POST | `/tutores` | JWT | tutores:ver / tutores:crear |
| Ayudas | GET/POST | `/ayudas` | JWT | ayudas:ver / ayudas:crear |
| Ayudas | PATCH | `/ayudas/:id/estado` | JWT | ayudas:editar |
| Supervivencias | GET/POST | `/supervivencias` | JWT | supervivencias:ver / supervivencias:crear |
| Nutricion | GET/POST | `/nutricion/menus` | JWT | nutricion:ver / nutricion:crear |
| Merito | GET/POST | `/merito/periodos` | JWT | merito:ver / merito:crear |
| Merito | POST | `/merito/periodos/:id/notas` | JWT | merito:crear |
| Merito | GET | `/merito/periodos/:id/ganadores` | JWT | merito:ver |
