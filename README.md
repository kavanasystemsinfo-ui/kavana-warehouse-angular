# Kavana-Warehouse Angular

Migración del frontend de **Kavana-Warehouse** de React (Vite) a **Angular 21 standalone**. El backend original (Node.js/Express + Prisma/PostgreSQL) no se ha tocado: la app Angular se conecta a él vía proxy.

## Propósito

Demostrar competencia real con Angular: componentes standalone, enrutamiento, servicios inyectables, formularios reactivos, interceptores HTTP y consumo de una API REST con autenticación JWT. Es un proyecto de portafolio para postulaciones que piden Angular.

## Funcionalidad migrada

Pantallas portadas desde el frontend React original, todas funcionando contra el backend real:

- Login JWT con guardado de token y usuario
- Dashboard: coste por centro vs presupuesto del mes
- Inventario: catálogo de productos con coste unitario y stock mínimo
- Costes por centro: consumo vs presupuesto
- Responsables: asignación de usuarios a centros
- Centros: gestión con productos asignados
- Deviations: control de mermas por centro
- Incidents: incidencias en instalaciones
- Asistente (placeholder) y Supervisores (demo)

## Stack

- Angular 21 (standalone components, Angular Router, HttpClient)
- TypeScript
- SCSS
- Node.js >= 18
- Backend: Node/Express + Prisma + PostgreSQL (repositorio `Kavana-Warehouse` original)

## Cómo arrancar

1. **Backend**: clona y arranca el backend original `Kavana-Warehouse` en `http://localhost:3000` (requiere PostgreSQL con migraciones y seed aplicados).

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
 ├─ services/
 │   ├─ api.service.ts           # Todas las llamadas a la API (métodos tipados)
 │   └─ auth.interceptor.ts      # Inyecta Authorization: Bearer <token>
 ├─ layout/
 │   └─ layout.component.*       # Contenedor con router-outlet
 ├─ pages/
 │   ├─ login/                   # Formulario de acceso
 │   ├─ dashboard/               # Costes por centro del mes
 │   ├─ inventario/              # Catálogo de productos
 │   ├─ costes/                  # Coste vs presupuesto
 │   ├─ responsables/            # Asignación de responsables
 │   ├─ centros/                 # Centros de trabajo
 │   ├─ deviations/              # Mermas
 │   ├─ incidents/               # Incidencias
 │   ├─ supervisores/            # Demo de supervisores
 │   └─ asistente/               # Placeholder de asistente
 ├─ app.config.ts                # Providers: routing, HTTP, interceptor, ApiService
 └─ app.routes.ts                # Definición de rutas
```

## Autenticación

- `ApiService.login()` guarda el token JWT y el usuario en `localStorage`.
- `AuthInterceptor` añade `Authorization: Bearer <token>` a cada petición saliente.
- Endpoint de logout del backend.

## Notas técnicas

- Sin biblioteca de estado global: cada componente gestiona su estado local con suscripciones RxJS.
- `zone.js` está configurado como polyfill y `provideZoneChangeDetection()` está activo en `app.config.ts`. Sin esto, las respuestas HTTP no disparan detección de cambios y la vista se queda congelada en "Cargando..." (fue un bug real encontrado y corregido durante la migración).
- Los estilos SCSS son mínimos; el foco de este proyecto es la lógica y la arquitectura Angular, no el diseño.

## Build de producción

```bash
ng build --configuration production
# Salida en dist/kavana-warehouse-angular/
```

## Estado

Completado y verificado de punta a punta contra el backend real: login, dashboard, inventario, centros y costes muestran datos reales de la BD (probado en navegador). El backend original vive en el repo `kavanasystemsinfo-ui/Kavana-Warehouse`.