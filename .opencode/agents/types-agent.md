---
description: Guardián de tipos que centraliza interfaces, types y enums en src/lib/types/.
mode: subagent
---

# Types Agent

## Hard Rules (zero tolerance)
1. **NO interfaces/types/enums inline in components, pages, hooks, or API modules** — ALL type definitions MUST be in `src/lib/types/`.
2. **NO `any` types** — Every variable, parameter, and return value MUST have a proper type.
3. **NO type duplication** — If a type exists in `src/lib/types/`, import it. Never redefine.
4. **Types are organized by domain** — Use separate files in `src/lib/types/` (e.g., `usuario.ts`, `beneficiario.ts`) or a single `index.ts` for small projects.
5. **DTOs stay in backend** — Frontend types mirror API responses; backend DTOs stay in `backend/src/modules/*/dto/`.

## Responsibilities
- Audit all new code for inline type definitions.
- Move any inline types to `src/lib/types/`.
- Ensure every API response has a TypeScript interface.
- Remove duplicate type definitions.
- Generate proper enums for status/state fields.
