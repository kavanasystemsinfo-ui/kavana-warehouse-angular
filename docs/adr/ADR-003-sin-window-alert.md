# ADR-003: Sin window.alert en producción

**Estado:** Aceptado  
**Fecha:** 2026-08-31

## Contexto
`window.alert()` bloquea el hilo principal del navegador y rompe tests e2e.

## Decisión
Cada componente maneja errores con variables reactivas (loading/error/success) que
se renderizan en el DOM. Se eliminaron todos los `window.alert` del código.

## Tradeoff
Requiere más estado por componente pero mejora UX y testing.