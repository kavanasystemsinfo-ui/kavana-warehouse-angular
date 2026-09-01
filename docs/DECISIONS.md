# DECISIONS — Frontend Angular Kavana-Warehouse

Registro de decisiones de arquitectura y bugs corregidos durante la migración
React → Angular (repo `kavana-warehouse-angular`). Complementa al README.

## ADR-001: Logout y refresh local (no hay endpoint)

**Contexto**: El panel React original llamaba a `POST /auth/refresh` y
`POST /auth/logout`; el backend (`src/app.js` del repo original) **no expone
ninguno de los dos** (verificado por grep 2026-08-31). El login sí devuelve
`refreshToken`, pero no hay endpoint que lo use.

**Decisión**: el logout es local (borrar `dashboard_access_token`,
`dashboard_refresh_token`, `dashboard_user`). El interceptor limpia credenciales
ante 401/403 y el `AuthGuard` redirige a `/login`. No se implementa refresh
token rotation en el frontend mientras el backend no tenga el endpoint.

**Tradeoff**: la sesión dura exactamente lo que dura el JWT (2 h). Al expirar,
el usuario vuelve a login. Correcto para una demo/portfolio; si el backend
añade `/auth/refresh`, se reintroduce la rotación.

## ADR-002: Formato numérico español propio (no pipes de Angular)

**Contexto**: Jorge exige formato español: punto de miles, coma decimal, sin
decimales si no los hay. El pipe `| number` de Angular usa localización
anglosajona por defecto (12,415 → "12,415" con coma como miles) y
`toLocaleString('es-ES')` omite el punto de miles en grupos de 1 dígito
(5314 → "5314", no "5.314").

**Decisión**: helpers propios `fmtNum`/`fmtEuro` en `src/app/lib/format.ts`,
con unit tests, expuestos como propiedades públicas en cada componente para
usarlos en los templates. Cualquier cifra de la UI pasa por ellos.

## ADR-003: Sin window.alert en el manejo de errores

**Contexto**: la primera versión de `ApiService.handleError` llamaba a
`window.alert`, que bloquea el hilo del navegador, congela la UI y rompe los
harness de pruebas e2e.

**Decisión**: `handleError` devuelve un `Error` con mensaje en español; cada
componente muestra su propio `error` en un `<div class="alert alert-danger">`.
El interceptor limpia tokens silenciosamente en 401/403.

## ADR-004: Endpoints reales de supervisores

**Contexto**: la primera versión de Angular llamaba a
`GET/POST /api/v1/supervisores/demo`. El backend solo tiene
`GET /api/v1/supervisores?session_id=` y `POST /api/v1/supervisores`
(con `session_id` en el body). La primera versión daba 404 en producción.

**Decisión**: `getSupervisoresDemo()` → `GET /supervisores?session_id=...`;
`createSupervisorDemo()` → `POST /supervisores` con el payload completo.
Cubierto por tests (spec de ApiService).

## ADR-005: Incidencias — total calculado en frontend

**Contexto**: `GET /api/v1/incidencias` devuelve solo `{ incidencias }`; la
tarjeta "Total" del panel esperaba `total` → siempre vacía.

**Decisión**: el servicio mapea la respuesta a
`{ incidencias, total: incidencias.length }`. El total es de la página
actual (el backend no pagina), consistente con el comportamiento del React.

## ADR-006: Password obligatoria en responsables

**Contexto**: `Responsables.tsx` (React) y la primera versión Angular usaban
`password: form.password || 'kavanawarehouse'` → contraseña por defecto
conocida.

**Decisión**: la contraseña es obligatoria (mín. 6 caracteres) en el formulario.
Se elimina cualquier valor por defecto.

## ADR-007: Modo visita (solo lectura) en la UI

**Contexto**: los visitantes de la demo (cuenta demo o supervisores con
`session_id`) reciben 403 al escribir. La primera versión Angular mostraba
botones de escritura igualmente (UX rota).

**Decisión**: `ApiService.esVisita()` (mismo criterio que el React). Los
componentes con escritura (inventario, incidents, deviations) ocultan/bajan
los botones de crear/borrar/cambiar estado en modo visita.

## ADR-008: Decide el periodo por parámetro, no por estado

**Contexto**: pitfall conocido del proyecto (RouteAI/Warehouse 2026-08-04):
`loadData` que lee el estado de periodo justo después de cambiarlo carga un
clic desfasado (setState es asíncrono).

**Decisión**: `DashboardComponent.loadData()` construye `desde/hasta` desde
`periodo.periodo` al inicio y los pasa explícitamente a `getConsumption()`.
La suscripción a `periodo$` recarga al cambiar el selector.

## ADR-009: Limpieza de código muerto

**Contexto**: cada componente heredó métodos copiados
(`trackById`, `getBarWidth`, `formatDate`) que no usaba su template.

**Decisión**: eliminados con verificación automática (scan TS vs HTML).
Los que quedan son los que el template referencia (verificado por scan).