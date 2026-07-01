# Code Duplication Analysis Report

**Date**: June 28, 2026  
**Scope**: Full codebase (backend + frontend)  
**Methodology**: Manual code review of patterns across modules

---

## Summary

The codebase shows moderate levels of code duplication, primarily in:

1. **Frontend API layer** - Repetitive CRUD patterns across 14 API modules
2. **Backend services** - Common CRUD patterns with minor variations
3. **Backend modules** - Similar entity/controller/service/module structures
4. **Frontend components** - Similar form and modal patterns

---

## Findings

### Finding 1: Frontend API Layer — CRUD Duplication (High)

**Location**: `frontend/src/lib/api/*.ts` (14 files)

**Pattern**: Almost every API module follows this exact pattern:

```typescript
export const moduleApi = {
  getAll: async (filters?: any): Promise<Type[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    const response = await apiClient.get(`/route?${params}`);
    return response.data;
  },
  getById: async (id: string): Promise<Type> => {
    const response = await apiClient.get(`/route/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<Type> => {
    const response = await apiClient.post('/route', data);
    return response.data;
  },
  update: async (id: string, data: any): Promise<Type> => {
    const response = await apiClient.patch(`/route/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/route/${id}`);
  },
  desactivar: async (id: string): Promise<Type> => {
    const response = await apiClient.patch(`/route/${id}/desactivar`);
    return response.data;
  },
};
```

**Files affected**:
- `asistencias.ts` (162 lines)
- `beneficiarios.ts` (139 lines)
- `clases.ts` (63 lines)
- `tutores.ts` (41 lines)
- `horarios.ts` (44 lines)
- `supervivencias.ts` (114 lines)
- `usuarios.ts` (71 lines) - different pattern (exports functions instead of object)
- `roles.ts` - different pattern (uses individual functions)
- `ayudas.ts` (67 lines)
- `nutricion.ts` (59 lines)
- `merito.ts` (82 lines)
- `dashboard.ts` (19 lines)

**Recommendation**: Create a generic CRUD API factory:

```typescript
// lib/api/crud-factory.ts
export function createCrudApi<T>(baseRoute: string) {
  return {
    getAll: async (filters?: any): Promise<T[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      const response = await apiClient.get(`${baseRoute}?${params}`);
      return response.data;
    },
    getById: async (id: string): Promise<T> => {
      const response = await apiClient.get(`${baseRoute}/${id}`);
      return response.data;
    },
    create: async (data: Partial<T>): Promise<T> => {
      const response = await apiClient.post(baseRoute, data);
      return response.data;
    },
    update: async (id: string, data: Partial<T>): Promise<T> => {
      const response = await apiClient.patch(`${baseRoute}/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`${baseRoute}/${id}`);
    },
    desactivar: async (id: string): Promise<T> => {
      const response = await apiClient.patch(`${baseRoute}/${id}/desactivar`);
      return response.data;
    },
  };
}
```

Then reduce each module to only define unique methods. For example, `horarios.ts` would become:

```typescript
export const horariosApi = {
  ...createCrudApi<Horario>('/horarios'),
  getDisponibles: async () => {
    const response = await apiClient.get('/horarios/disponibles');
    return response.data;
  },
};
```

---

### Finding 2: Backend Module Structure — Boilerplate Duplication (Medium)

**Location**: `backend/src/modules/*/` (13 modules)

**Pattern**: Every module follows the same NestJS structure:

- `{module}.entity.ts` - TypeORM entity
- `{module}.module.ts` - NestJS module definition
- `{module}.controller.ts` - REST controller
- `{module}.service.ts` - Business logic
- `dto/` - Data Transfer Objects
  - `create-{module}.dto.ts`
  - `update-{module}.dto.ts`
  - `filter-{module}.dto.ts`
  - (sometimes additional DTOs)

**Affected modules**:
- `asistencias` - 4 DTOs, service (867 lines), entity
- `beneficiarios` - 4 DTOs, service (626 lines), entity, +expediente entity
- `clases` - service, entity
- `horarios` - service, entity
- `tutores` - service, entity
- `usuarios` - 3 DTOs, service (221 lines), entity
- `roles` - 2 DTOs, service (148 lines), 2 entities
- `ayudas` - service, 2 entities, webhook, whatsapp
- `supervivencias` - 5 DTOs, service (483 lines), 3 entities
- `nutricion` - service, entity
- `merito` - service, 2 entities
- `reportes` - entity only

**Recommendation**: While NestJS encourages this modular structure by design, consider:
- Creating a `BaseService` class with common CRUD methods
- Using NestJS's `@nestjs/crud` package for standard CRUD modules
- Implementing a generic `BaseController` with overridable hooks

---

### Finding 3: Duplicate `calcularEdad` Function (Medium)

**Location**: 
- `frontend/src/components/beneficiarios/BeneficiarioForm.tsx` (lines 15-27)
- `backend/src/modules/beneficiarios/beneficiarios.service.ts` (lines 23-35)

**Code**:
```typescript
function calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  ...
}
```

**Issue**: The exact same age calculation logic is implemented independently on both frontend and backend. The logic differs in the backend (uses `Date | string | null`) vs frontend (uses `string`).

**Recommendation**: 
- Backend: Keep the canonical version in a utility function
- Frontend: Reuse via a shared utility (e.g., `frontend/src/lib/utils/age.ts`) or rely solely on the backend to calculate age

---

### Finding 4: Backend Service CRUD Patterns (Medium)

**Location**: Multiple backend services

**Pattern**: Almost every service follows this structure:

```typescript
async create(dto: CreateDto): Promise<Entity> {
  // Check for duplicates
  const existe = await this.repository.findOne({ where: { campo: dto.campo } });
  if (existe) throw new ConflictException('...');
  
  const entity = this.repository.create(dto);
  return await this.repository.save(entity);
}

async findAll(filters?: FilterDto): Promise<Entity[]> {
  const query = this.repository.createQueryBuilder('alias')
    .leftJoinAndSelect('alias.relation1', 'relation1')
    .orderBy('alias.campo', 'ASC');
  // Optional filters...
  return await query.getMany();
}

async findOne(id: string): Promise<Entity> {
  const entity = await this.repository.findOne({ where: { id }, relations: [...] });
  if (!entity) throw new NotFoundException(`Entity with ID ${id} not found`);
  return entity;
}

async update(id: string, dto: UpdateDto): Promise<Entity> {
  const entity = await this.findOne(id);
  // Merge DTO...
  return await this.repository.save(entity);
}

async remove(id: string): Promise<void> {
  const entity = await this.findOne(id);
  await this.repository.remove(entity);
}
```

**Examples**:
- `asistencias.service.ts` - 867 lines (most complex)
- `beneficiarios.service.ts` - 626 lines (Excel import adds complexity)
- `supervivencias.service.ts` - 483 lines
- `usuarios.service.ts` - 221 lines
- `roles.service.ts` - 148 lines
- `clases.service.ts` - moderate
- `tutores.service.ts` - moderate
- `horarios.service.ts` - moderate

**Recommendation**: Consider a `BaseService<T>` generic class:

```typescript
export class BaseService<T> {
  constructor(protected repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return await this.repository.save(entity);
  }

  async findOne(id: string, relations: string[] = []): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as any, relations });
    if (!entity) throw new NotFoundException(`Entity not found`);
    return entity;
  }

  async update(id: string, dto: DeepPartial<T>): Promise<T> {
    await this.findOne(id); // exists check
    await this.repository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }
}
```

---

### Finding 5: Similar Component Patterns in Frontend (Low)

**Location**: `frontend/src/components/beneficiarios/` and `frontend/src/components/supervivencia/`

**Pattern**: Form components share similar structure:
```typescript
export default function XForm({ item, onSubmit, onCancel }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({...});

  useEffect(() => {
    if (item) { /* populate formData */ }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  // ... render form
}
```

**Affected**:
- `BeneficiarioForm.tsx`
- `SupervivenciaForm.tsx`

**Recommendation**: Create a reusable form wrapper or hook (`useFormSubmission`) that handles loading, error, and submit states:

```typescript
function useFormSubmission(onSubmit: (data: any) => Promise<void>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (data: any) => {
    setError('');
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isLoading, error, handleSubmit };
}
```

---

### Finding 6: Repeated URLSearchParams Pattern (Low)

**Location**: All frontend API modules

**Pattern**: Building query parameters is duplicated ~20+ times:

```typescript
const params = new URLSearchParams();
if (fechaInicio) params.append('fechaInicio', fechaInicio);
if (fechaFin) params.append('fechaFin', fechaFin);
```

**Recommendation**: Create a helper function:

```typescript
function buildQueryParams(params: Record<string, string | undefined | null>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}
```

---

## Overall Recommendations

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 High | Frontend API CRUD factory | 2-3 hours | Reduces API files by ~60% |
| 🟡 Medium | Backend BaseService | 4-6 hours | Standardizes all services |
| 🟡 Medium | Deduplicate calcularEdad | 30 min | Small, clean win |
| 🟢 Low | URLSearchParams helper | 30 min | Reduces boilerplate |
| 🟢 Low | useFormSubmission hook | 1 hour | Standardizes form handling |
| 🟢 Low | Module structure generator | N/A | For future modules |

---

## Conclusion

The code duplication is primarily structural boilerplate rather than logic duplication. While it doesn't introduce bugs, it increases maintenance burden and the risk of inconsistencies. The highest value refactors would be:

1. **API CRUD factory** (frontend) - immediately reduces code volume and standardizes patterns
2. **BaseService** (backend) - standardizes CRUD operations across all 13 modules
3. **Small utility functions** - fast wins with immediate impact

**Estimated total effort**: 8-12 hours for all recommended refactors
