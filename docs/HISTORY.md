# Historial — Kavana Warehouse Frontend

## Línea temporal

| Fecha | Evento |
|-------|--------|
| 2026-08-28 | Inicio migración React → Angular |
| 2026-08-31 | Backend Fastify verificado: sin logout/refresh, supervisores en /supervisores |
| 2026-09-01 | Componentes principales terminados (login, dashboard, inventario, costes, centros, incidencias) |
| 2026-09-02 | Auditoría KAVANA: SPEC, ADRs, tests, README |

## Decisiones descartadas

1. **Supervisores demo en `/supervisores/demo`** → 404. Migrado a `/supervisores` con `?session_id=`.
2. **Password vacía permitida** → Riesgo de seguridad. Ahora siempre obligatoria.
3. **`window.alert` para errores** → Bloquea el hilo. Eliminado, errores en DOM.
4. **React como framework** → Migrado a Angular 21 standalone.

## Lessons learned

- Verificar endpoints reales del backend antes de escribir frontend (ADR-004).
- `window.alert` rompe tests e2e y bloquea UX (ADR-003).
- Formato numérico local importa: adoptar desde el inicio (ADR-002).