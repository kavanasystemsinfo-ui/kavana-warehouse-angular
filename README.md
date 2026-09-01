# KAVANA Warehouse — Frontend Angular

Migración del panel de control de **Kavana-Warehouse** (SaaS de control de stock
para limpieza multi-centro) de React (Vite) a **Angular 21 standalone**. El
backend original (Node.js/Express + Prisma/PostgreSQL) no se ha tocado: la app
Angular se conecta a él vía proxy en desarrollo y por URL pública en producción.

## Propósito

Demostrar competencia real con Angular: componentes standalone, enrutamiento
con guards, servicios inyectables, formularios reactivos, interceptores HTTP,
señales de estado global y consumo de una API REST con autenticación JWT. Es
un proyecto de portafolio para postulaciones que piden Angular.

## Funcionalidad migrada (paridad con el panel React original)

- **Login JWT** con guardado de token y usuario, redirección si ya hay sesión,
  validación por rol y widget de asistente técnico en la propia pantalla.
- **Dashboard**: KPIs (gasto OPEX, movimientos, alertas críticas y avisos),
  gráfica de evolución mensual, filtros por centro/producto, consumo por centro
  con barras de presupuesto, últimos movimientos y exportación CSV.
- **Inventario**: catálogo de productos con coste unitario y stock mínimo,
  CRUD completo y **propuesta de compra** exportable a CSV.
- **Costes por centro**: consumo vs presupuesto con barras de estado y edición
  de presupuesto mensual.
- **Centros**: tabla con detalle desplegable (productos asignados y stock),
  alta/edición y añadir productos con stock inicial/mínimo.
- **Responsables**: asignación de centros con checkboxes e histórico de recuentos.
- **Deviations**: control de mermas con conteo físico y reset de datos demo.
- **Incidents**: incidencias por centro con filtros y cambio de estado.
- **Supervisores demo**: crear supervisores de prueba con caducidad 24 h
  (solo lectura para visitantes; acciones de escritura ocultas en modo demo).
- **Asistente técnico**: chat contra `POST /api/v1/assistant` que responde con
  la documentación real del proyecto (README, DECISIONS, ADRs), visible también
  como widget flotante en el login.
- **Selector de periodo global** (mes actual/anterior, semana, todo, personalizado)
  que aplica al Dashboard y a Incidencias.

## Stack

- Angular 21 (standalone components, Angular Router, HttpClient)
- TypeScript 5.9
- SCSS (estilos portados del CSS global del panel React)
- Jasmine + Karma (unit tests, ChromeHeadless)
- Node.js >= 18
- Backend: Node/Express + Prisma + PostgreSQL (repo `Kavana-Warehouse` original)

## Cómo arrancar

1. **Backend**: clona y arranca el backend original `Kavana-Warehouse` en
   `http://localhost:3000` (requiere PostgreSQL con migraciones y seed aplicados).

2. **Frontend**:
   ```bash
   npm install
   ng serve --proxy-config proxy.conf.json --port 4201
   ```
   Abre `http://localhost:4201`. El proxy redirige `/api/v1` a `localhost:3000`.

3. **Credenciales demo** (las que crea el seed del backend):
   - Email: `supervisor.demo@kavanawarehouse.com`
   - Contraseña: `kavana`

## Estructura

```
src/app/
 ├─ components/
 │   ├─ assistant-chat/          # Chat del asistente + widget flotante (login)
 │   ├─ guia-ayuda/              # Botón ❓ Ayuda + modal contextual reutilizable
 │   └─ periodo-selector/        # Selector de periodo global (Layout)
 ├─ services/
 │   ├─ api.service.ts           # Cliente API tipado (todos los endpoints)
 │   ├─ api.service.spec.ts      # Tests del cliente con HttpTestingController
 │   ├─ auth.interceptor.ts      # Authorization: Bearer + limpieza en 401/403
 │   ├─ periodo.service.ts       # Estado global de periodo (BehaviorSubject)
 │   └─ periodo.service.spec.ts
 ├─ guards/
 │   ├─ auth.guard.ts            # Protege rutas; redirige a /login
 │   └─ auth.guard.spec.ts
 ├─ lib/
 │   ├─ format.ts                # fmtNum/fmtEuro (formato numérico español)
 │   ├─ csv.ts                   # toCsv/downloadCsv (exportación CSV)
 │   └─ *.spec.ts
 ├─ layout/                      # Sidebar, navegación, logout, selector de periodo
 ├─ pages/
 │   ├─ login/                   # Formulario de acceso + widget asistente
 │   ├─ dashboard/               # KPIs, evolución, filtros, consumo, CSV
 │   ├─ inventario/              # Catálogo CRUD + propuesta de compra CSV
 │   ├─ costes/                  # Coste vs presupuesto por centro
 │   ├─ centros/                 # Centros con detalle y productos
 │   ├─ responsables/            # Asignación de responsables + recuentos
 │   ├─ deviations/              # Mermas y conteo físico
 │   ├─ incidents/               # Incidencias con filtros
 │   ├─ supervisores/            # Supervisores demo (caducan 24h)
 │   └─ asistente/               # Chat del asistente técnico
 ├─ app.config.ts                # Providers: routing, HTTP, interceptor
 └─ app.routes.ts                # Rutas protegidas por AuthGuard
```

## Autenticación y sesión

- `ApiService.login()` guarda el JWT y el usuario en `localStorage`.
- `AuthInterceptor` inyecta `Authorization: Bearer <token>` y, ante un
  401/403, limpia las credenciales para que el guard redirija a `/login`.
- El logout es **local** (borrar tokens): el backend no expone
  `POST /auth/logout` ni `/auth/refresh` (verificado en `src/app.js`), así que
  la sesión dura lo que dura el JWT (2 h) y al expirar se pide login de nuevo.
- Los visitantes de la demo (cuenta `warehouse`/`kavana` o supervisores con
  `session_id`) se detectan con `ApiService.esVisita()`: las acciones de
  escritura se ocultan en la UI.

## Formato numérico español (regla del cliente)

Todas las cifras usan `fmtNum`/`fmtEuro` (`src/app/lib/format.ts`): punto de
miles (12.415), coma decimal (43,5), sin decimales si no los tiene. NO se usa
`toLocaleString('es-ES')` (omite el punto de miles en grupos de 1 dígito) ni el
pipe `| number` de Angular (localización anglosajona por defecto).

## Notas técnicas

- `zone.js` está configurado como polyfill y `provideZoneChangeDetection()` está
  activo en `app.config.ts`. Sin esto, las respuestas HTTP no disparan detección
  de cambios y la vista se queda congelada en "Cargando..." (bug real corregido
  durante la migración).
- Sin biblioteca de estado global: `PeriodoService` (BehaviorSubject) cubre el
  estado de periodo y cada componente gestiona su estado local con RxJS.
- El selector de periodo recibe `loadData(from, to)` como parámetros explícitos
  (evita el pitfall del estado asíncrono: nunca leer estado recién cambiado en
  el propio load).
- Los estilos viven en `src/styles.scss`, portados del `index.css` del panel
  React para paridad visual.

## Build y tests

```bash
ng build --configuration production   # salida en dist/kavana-warehouse-angular/browser/
ng test --watch=false --browsers=ChromeHeadlessNoSandbox   # unit tests
```

CI (`.github/workflows/ci.yml`): build de producción + unit tests con Chrome
headless en cada push/PR a `main`.

## Estado

Paridad funcional completa con el panel React original, verificada de punta a
punta contra el backend real (login, dashboard, inventario, centros, costes,
deviations, incidents, responsables, supervisores, asistente). El backend
original vive en el repo `kavanasystemsinfo-ui/Kavana-Warehouse`.

Decisiones de arquitectura y bugs corregidos: `docs/DECISIONS.md`.