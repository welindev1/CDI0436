# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-28

### Added

#### Backend
- **Módulo de Autenticación**: Login JWT, registro, validación de token, guards (JwtAuthGuard, PermisosGuard), decorators (Public, CurrentUser, RequierePermiso), estrategia JWT con Passport
- **Módulo de Asistencias**: CRUD completo, registro masivo, justificación masiva, fotos en base64, reportes por clase/beneficiario/tutor/global/ausencias, estadísticas mensuales, resumen por fecha
- **Módulo de Beneficiarios**: CRUD completo, expedientes, importación desde Excel con validación, exportación a Excel, búsqueda pública, cumpleaños por mes, reporte de carpetas, asignación a clases
- **Módulo de Clases**: CRUD completo, asignación/remoción de beneficiarios, estadísticas
- **Módulo de Horarios**: CRUD completo, horarios disponibles
- **Módulo de Tutores**: CRUD completo
- **Módulo de Usuarios**: CRUD completo, cambio de contraseña (primer login), reset de contraseña
- **Módulo de Roles y Permisos**: CRUD de roles, permisos agrupados por módulo, asignación masiva a roles
- **Módulo de Ayudas**: CRUD de solicitudes de ayuda, cambio de estado, comentarios, foto de entrega, webhook para integración externa, servicio WhatsApp
- **Módulo de Supervivencia**: CRUD de cursos, asistencias con fotos, historial de asistencias
- **Módulo de Nutrición**: Menús diarios por tanda (matutina/vespertina)
- **Módulo de Mérito Escolar**: Períodos académicos, registro de notas (matemáticas, lengua, naturales, sociales), cálculo de ganadores por ciclo (primaria/secundaria)
- **Infraestructura**: Configuración modular con ConfigModule, TypeORM con PostgreSQL, SSL configurable, Swagger/OpenAPI en /apidocs
- **Seguridad**: Headers de seguridad (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS), CORS con lista blanca, rate limiting con ThrottleGuard in-memory, filtro global de excepciones HTTP, pipe de validación custom
- **Docker**: Dockerfile multi-etapa para producción, Dockerfile.dev para desarrollo, docker-compose.yml con PostgreSQL 15 Alpine

#### Frontend
- **App Router**: Next.js 16 con layout raíz, dashboard protegido, login, register
- **Autenticación**: AuthContext con login, registro, logout, "Recordarme" (localStorage/sessionStorage), validación de token en segundo plano, helpers de permisos (tienePermiso, tieneAlgunPermiso, esSuperAdmin), cambio de contraseña en primer login
- **Dashboard**: Layout con Sidebar responsiva (menú colapsable en móvil), Header con información de usuario, rutas protegidas con ProtectedRoute
- **Módulo de Asistencias**: Registro visual de asistencias con estados (Presente/Ausente/Sin marcar), búsqueda por nombre, observaciones por beneficiario, acción "Marcar todos", fotos de asistencia, reportes filtrados
- **Módulo de Beneficiarios**: CRUD completo con formulario, importación desde Excel, expedientes, edición de perfil
- **Módulo de Clases**: CRUD completo con gestión de beneficiarios
- **Módulo de Horarios**: CRUD completo
- **Módulo de Tutores**: CRUD completo
- **Módulo de Usuarios**: CRUD completo con cambio/reset de contraseña
- **Módulo de Roles y Permisos**: CRUD de roles, visor de permisos agrupados
- **Módulo de Ayudas**: Gestión de solicitudes con cambio de estado y comentarios
- **Módulo de Supervivencia**: CRUD de cursos, asistencia con fotos
- **Módulo de Nutrición**: Menús diarios por tanda
- **Módulo de Mérito Escolar**: Períodos, registro de notas, dashboard, cálculo de ganadores
- **Componentes UI**: Button, Input, Select, Modal, Table, Alert, Loading reutilizables con variantes (primary, secondary, outline, ghost, danger)
- **Utilidades**: Exportación a Excel (xlsx + file-saver), exportación a PDF (jspdf + autotable), helper cn (clsx + tailwind-merge)
- **API Layer**: Cliente Axios con interceptores para token JWT y manejo de errores 401
- **Páginas Dashboard**: asistencias, ayudas, beneficiarios, bonos, clases, cumpleaños, horarios, mérito, nutrición, reportes, roles, supervivencia, tutores, usuarios

### Changed
- Initial project setup and configuration

### Fixed
- Initial release - no fixes applicable

---

## [Unreleased]
### Added
- (Placeholder for next release features)
### Changed
- (Placeholder for changes in existing functionality)
### Deprecated
- (Placeholder for soon-to-be removed features)
### Removed
- (Placeholder for removed features)
### Fixed
- (Placeholder for bug fixes)
### Security
- (Placeholder for security improvements)
