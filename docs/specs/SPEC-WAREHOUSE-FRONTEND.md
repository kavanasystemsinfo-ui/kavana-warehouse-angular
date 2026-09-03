# SPEC-WAREHOUSE-FRONTEND

**Nombre:** Panel de control KAVANA Warehouse (Angular)  
**Versión:** 1.0  
**Fecha:** 2026-09-02  
**Autor:** Jorge Adán / Kavana Systems

---

## 1. Contexto

Migración del dashboard React (Vite) a Angular 21 standalone. El backend Fastify
expone `/api/v1/...`. El frontend consume esos endpoints, gestiona sesión JWT
(localStorage) y renderiza 10 páginas: login, dashboard, inventario, costes,
centros, desviaciones, incidencias, supervisores demo, responsables y asistente.

## 2. Requisitos funcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| F-01 | Login por email/password con JWT (sin refresh: logout local) | Alta |
| F-02 | Dashboard: consumo por centro, barras, evolución mensual, alertas | Alta |
| F-03 | Inventario: CRUD productos, gestión stock por centro, propuesta compra CSV | Alta |
| F-04 | Costes: vista por centro, edición presupuesto | Alta |
| F-05 | Centros: CRUD centros, asignación de limpiadores | Alta |
| F-06 | Desviaciones: stock físico vs sistema | Media |
| F-07 | Incidencias: creación, listado, cambio de estado | Media |
| F-08 | Supervisores demo: CRUD con session_id 24 h | Baja |
| F-09 | Responsables: asignación de centros | Media |
| F-10 | Asistente IA chat flotante | Baja |

## 3. Requisitos no funcionales

| ID | Requisito | Valor |
|----|-----------|-------|
| NF-01 | Build producción < 3 MB gzip | Angular standalone |
| NF-02 | Formato numérico español (punto miles, coma decimal) | `fmtNum` / `fmtEuro` |
| NF-03 | Sin `window.alert` en producción | ADR-003 |
| NF-04 | Logout = borrar tokens localmente | ADR-001 |
| NF-05 | Rol `limpiador` solo lectura (sin acceso a panel) | ADR-007 |

## 4. Stack

Angular 21, TypeScript, RxJS, SCSS, Karma/Jasmine, Angular CLI, CI GitHub Actions.

## 5. API consumida

Backend Fastify con rutas bajo `/api/v1/`. Autenticación Bearer JWT.

## 6. Decisiones clave

Ver `docs/DECISIONS.md` → 9 ADRs que documentan cada decisión de diseño.
