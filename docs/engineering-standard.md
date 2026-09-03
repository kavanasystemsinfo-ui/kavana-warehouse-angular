# Estándar de Ingeniería KES — Kavana Warehouse Frontend

**Versión:** 1.0  
**Fecha:** 2026-09-02

## 1. Estructura del proyecto

```
src/app/
├── pages/          # Componentes de página (standalone)
├── components/     # Componentes reutilizables
├── services/       # Servicios inyectables (ApiService, PeriodoService)
├── guards/         # AuthGuard
├── lib/            # Helpers puros (format.ts, csv.ts)
└── layout/         # Layout con sidebar
```

## 2. Convenciones

- **Componentes:** Standalone, prefix `app-`, scss separado.
- **Servicios:** `providedIn: 'root'`, métodos retornan `Observable<T>`.
- **Tests:** Jasmine + Karma, `HttpClientTestingModule`, 1 test por flujo crítico.
- **Formato numérico:** Siempre `fmtNum` / `fmtEuro` (ADR-002).
- **Error handling:** Sin `window.alert` (ADR-003). Errores en variables reactivas.

## 3. Flujos obligatorios

1. Nouveau composant → `standalone: true` + test `.spec.ts`.
2. Nouveau endpoint → test en `api.service.spec.ts`.
3. Cambio de ADR → actualizar `DECISIONS.md`.
4. Release → `CHANGELOG.md` actualizado.