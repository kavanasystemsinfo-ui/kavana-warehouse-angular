# ADR-001: Logout y refresh local (sin backend)

**Estado:** Aceptado  
**Fecha:** 2026-08-31

## Contexto
El backend Fastify NO expone `POST /auth/logout` ni `POST /auth/refresh`. La sesión
se gestiona únicamente con tokens JWT en localStorage.

## Decisión
Logout = borrar tokens del localStorage y redirigir a `/login`. No hay refresh de
tokens; si el JWT expira, el interceptor redirige al login.

## Tradeoff
Simplifica el backend pero el usuario pierde la sesión al cerrar el navegador
si el token expiró. Aceptable para un panel interno de uso diario.