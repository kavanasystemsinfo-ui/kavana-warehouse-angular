# ADR-010: Coste cero y decisiones tomadas por presupuesto

**Estado:** Aceptado  
**Fecha:** 2026-09-17  
**Resumen:** Formalizar que este frontend es una pieza de portafolio con un solo
usuario real (su autor) y coste ≈ 0 €/mes, dejando por escrito qué decisiones se
tomaron por presupuesto y qué cambiaría con usuarios reales y presupuesto.

## Contexto

`kavana-warehouse-angular` es la migración del panel de stock de KAVANA Warehouse
de React (Vite) a Angular 21 standalone, con fines de portafolio para
postulaciones que piden Angular (ver `README.md` → Propósito). Solo la usa su
autor: no hay clientes, ni datos de producción, ni usuarios concurrentes.

Con ese marco, el criterio dominante al decidir no ha sido «qué es lo correcto
para un producto en producción», sino «qué es correcto y además cuesta 0 €/mes».
Eso afecta a alojamiento, autenticación, gestión de usuarios, datos y pruebas.
El riesgo de no documentarlo es doble: que quien lea el repo confunda
restricciones de presupuesto con desconocimiento, o que se arrastren esas
decisiones a un proyecto con usuarios reales sin revisarlas.

Alternativas ya decididas en su propio ADR y que aquí solo se enmarcan:
logout/refresh local (ADR-001), formato numérico español (ADR-002) y rol de
visita solo lectura en la UI (ADR-007).

## Decisión

Se hace explícito el encuadre en el `README.md`, con una sección dedicada
(«💰 Cómo está construido y cómo lo construiría con presupuesto») y este ADR, que
actúa como registro de las partidas afectadas: alojamiento y entornos, datos y
multi-cliente, autenticación, usuarios y roles, estado y UI, tests y CI, y
asistente técnico.

Se decide:

1. **Mantener** el coste ≈ 0 €/mes mientras el proyecto siga siendo de portafolio
   con un único usuario.
2. **Aceptar** las limitaciones derivadas (un solo conjunto de datos de
   demostración, sesión sin refresh, permisos de escritura solo ocultos en la
   UI, sin e2e, sin entorno de staging) y **declararlas** en vez de disimularlas.
3. **Documentar** para cada partida qué cambiaría con usuarios reales y
   presupuesto, de modo que la revisión sea una decisión consciente y no un
   redescubrimiento.

## Alternativas evaluadas

| Alternativa | Por qué no (hoy) | Cuándo tendría sentido |
|---|---|---|
| Hosting gestionado + dominio propio + staging | Añade coste mensual recurrente sin usuarios a los que servir | Al primer usuario real |
| Multi-tenant con aislamiento por cliente y backups automáticos | Cada cliente extra encarece la infraestructura; hoy el seed demo y `/demo/reset` bastan | Al primer cliente de pago |
| Refresh tokens, cookies `httpOnly` y revocación de sesiones | Requiere endpoints de backend que no existen (ADR-001); sin usuarios, no hay sesión que revocar | Al abrir la app a terceros |
| Gestión real de usuarios y roles con permisos en servidor | Reemplaza el modo visita/demo, cuyo coste actual es nulo | Al gestionar cuentas reales |
| Librería de estado global (NgRx/SignalStore) y librería de componentes accesible | `PeriodoService` con `BehaviorSubject` cubre el único estado compartido; una librería de UI es peso y curva de aprendizaje sin usuarios | Con pantallas y estados compartidos que crezcan |
| Suite e2e (Cypress/Playwright) y umbral de cobertura en CI | El CI en runners gratuitos ya cubre build + unit tests; e2e añade tiempo y mantenimiento | Antes de un despliegue con usuarios reales |
| Proveedor gestionado del asistente con cuota y moderación | El endpoint `POST /api/v1/assistant` ya responde desde la documentación del repo | Si el asistente se expone al público |

## Consecuencias

- Positivas: quien lea el repo entiende de inmediato el marco (portafolio, un
  usuario, 0 €/mes) y distingue restricción de presupuesto de decisión técnica;
  las limitaciones quedan declaradas y son auditables; el paso a un escenario
  con presupuesto tiene ya una lista de trabajo por partida.
- Negativas: la documentación asume limitaciones reales (permisos solo en la UI,
  sin refresh, sin e2e, sin staging) que en producción serían fallos, no deuda
  tolerable. La sección debe revisarse o retirarse si el proyecto deja de ser un
  portafolio; dejarla sin tocar en un producto con usuarios reales sería
  engañoso.
- Sin impacto en código: es un cambio exclusivamente de documentación.

## Señal de revisión

Revisar este ADR cuando ocurra cualquiera de estas tres cosas: (1) entra el
primer usuario real (distinto del autor), (2) el proyecto pasa a tener un
presupuesto mensual asignado, o (3) se despliega un entorno público distinto del
de demostración. Al dispararse, la partida afectada se convierte en trabajo real
y este ADR deja de justificar el statu quo.
