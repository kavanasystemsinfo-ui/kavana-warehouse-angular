# ADR-002: Formato numérico español

**Estado:** Aceptado  
**Fecha:** 2026-08-31

## Contexto
Los usuarios son de Castellón (España). El formato numérico americano (1,234.56)
genera confusión con costes y presupuestos.

## Decisión
Todas las cifras se formatean con `fmtNum` (punto de miles) y `fmtEuro` (coma decimal +
símbolo €). Helper centralizado en `src/app/lib/format.ts`.

## Tradeoff
Requiere configurar locale en pipes y formularios. Implementación centralizada minimiza
el impacto.