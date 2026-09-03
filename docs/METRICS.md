# Cobertura de tests — Kavana Warehouse Frontend

## Cuantitativo

| Archivo | Tests | Qué cubren |
|---------|-------|-----------|
| api.service.spec.ts | 15 | Login, logout, HTTP errors (401/403/0/500), todos los endpoints CRUD |
| auth.guard.spec.ts | 4 | Redirección a login, permitir ruta pública |
| auth.interceptor.spec.ts | 4 | Bearer token, expiración, refresh |
| periodo.service.spec.ts | 3 | BehaviorSubject, cambio de periodo |
| format.spec.ts | 5 | fmtNum, fmtEuro, locale español |
| csv.spec.ts | 3 | Generación CSV, BOM, encoding |
| **TOTAL** | **34** | |

## Cualitativo

- **api.service.spec.ts:** Cubre flujo feliz + 4 caminos de error HTTP. No mocks
  excesivos: usa `HttpClientTestingModule` real.
- **auth.guard.spec.ts:** Verifica redirect para no autenticado y paso para autenticado.
- **format.spec.ts:** Verifica punto de miles y coma decimal (regla de Jorge).

## Pendiente

- Tests de componentes (login, dashboard, inventario, costes) → FASE 2.
- Tests e2e con Cypress/Playwright → futuro.