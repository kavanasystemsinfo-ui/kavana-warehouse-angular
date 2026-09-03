# Decisiones (ADR) — Kavana Warehouse Frontend

| # | ADR | Estado | Fecha |
|---|-----|--------|-------|
| 001 | [Logout y refresh local](adr/ADR-001-logout-refresh-local.md) | Aceptado | 2026-08-31 |
| 002 | [Formato numérico español](adr/ADR-002-formato-numerico-español.md) | Aceptado | 2026-08-31 |
| 003 | [Sin window.alert](adr/ADR-003-sin-window-alert.md) | Aceptado | 2026-08-31 |
| 004 | [Endpoints supervisores](adr/ADR-004-endpoints-reales-supervisores.md) | Aceptado | 2026-08-31 |
| 005 | [Incidencias total calculado](adr/ADR-005-incidencias-total-calculado.md) | Aceptado | 2026-08-31 |
| 006 | [Password obligatoria](adr/ADR-006-password-obligatoria.md) | Aceptado | 2026-08-31 |
| 007 | [Rol limpiador solo lectura](adr/ADR-007-modo-visita-solo-lectura.md) | Aceptado | 2026-08-31 |
| 008 | [Periodo por parámetro](adr/ADR-008-periodo-por-parametro.md) | Aceptado | 2026-08-31 |
| 009 | [Limpieza código muerto](adr/ADR-009-limpieza-codigo-muerto.md) | Aceptado | 2026-08-31 |

## Decisiones descartadas

- **Supervisores en `/supervisores/demo`** → 404, migrado a `/supervisores` (ADR-004).
- **Password vacía en creación** → riesgo de seguridad, siempre obligatoria (ADR-006).
- **`window.alert` para errores** → bloquea hilo, eliminado (ADR-003).