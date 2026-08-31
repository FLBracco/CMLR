# Design Brief — CMLR (Clínica Online)

_Generado por /design-grill el 2026-08-31. Actualizar este archivo cuando cambien las decisiones de diseño._

## Product Context
- **Categoría:** SaaS app (dashboards, settings, formularios) — hoy de uso único por el profesional, pensado para escalar a recepción/multiusuario más adelante.
- **Target user:** Profesional de salud que atiende su propio consultorio, usa la app de forma variable (a veces escritorio, a veces celular), entre paciente y paciente.
- **Primary device/context:** Responsive real — no asumir desktop-first. Sesiones cortas e interrumpidas.
- **Defining screen:** Ficha del paciente (historia clínica + consultas) — es donde el profesional pasa más tiempo y donde el sistema tiene que sentirse confiable.

## Brand Personality
**5 adjetivos:** sobrio, preciso, confiable, calmo, discreto
**Meta emocional:** confiado
**Tono:** Un registro clínico serio que no se distrae con adornos, pero que no es frío — un detalle cálido puntual (color de acento, esquinas redondeadas) recuerda que hay un vínculo humano detrás de los datos.

## Visual References
- **Linear** — tipografía ajustada (heading scale prolijo), mucho whitespace, base neutra y poco color.
- **Jane.app** — paleta cálida/suave y esquinas redondeadas; ese calor se usa puntual (acento), no en toda la paleta.

## What to Avoid
- Sin competidores directos identificados por ahora — no hay un "no queremos parecernos a X" todavía. Revisar cuando el producto tenga usuarios/competencia real.

## Color System
- **Default mode:** Claro (dark mode: ver sección Dark Mode)
- **Temperature:** Neutra como base, con un acento saturado/vivo (inspirado en la calidez de Jane.app)
- **Primary color direction:** Un solo color de acento + neutros (no paleta completa)
- **Saturation:** Base neutra apagada + acento vivo puntual
- **Specific starting point** (punto de partida sugerido, a confirmar con `/tokens`):
  - primary/accent: `#E8734A` (terracota cálido, saturado)
  - background: `#FAFAFA` (gray-50)
  - text: `#18181B` (gray-900)
  - borders: `#E4E4E7` (gray-200), livianos 1px

## Typography
- **Typeface:** Sans geométrica (ej. Inter, Geist o DM Sans) — neutra, técnica, encaja con "sobrio/preciso" y con la referencia Linear.
- **Scale approach:** Balanceada — ni tan espaciosa como una landing ni tan densa como un dashboard de datos puro.
- **Heading/body:** Misma tipografía, variación de peso (700/800 para títulos, 400/500 para texto).
- **Suggested pair:** Una sola familia (a definir cuál en `/tokens`), sin segunda tipografía display.

## Component Style
- **Corner radius:** Redondeado 8–12px
- **Elevation:** Plano (sin sombras, solo bordes)
- **Density:** Balanceada
- **Borders:** Livianos, 1px sutil
- **Overall:** Redondeado y con un acento cálido puntual, pero plano/neutro/tipografía geométrica en la base — mantiene el registro sobrio sin sentirse frío.

## Animation
- **Level:** Mínima — casi estático. Solo feedback esencial (botón activo, error de formulario), sin animaciones de entrada/salida.
- **Key interaction to make feel great:** No definida aún — a confirmar cuando se use `/animate`.
- **Easing preference:** No aplica todavía dado el nivel mínimo de animación.

## Dark Mode
- Más adelante — construir con tokens desde ahora (el `:root` en `frontend/src/index.css`) para que sea fácil sumarlo después, pero no implementarlo todavía.

## Decisions Made
| Decision | What was decided | Why |
|----------|-----------------|-----|
| Categoría de producto | SaaS app | Aunque hoy es de un solo usuario, se prevé escalar a multiusuario/recepción |
| Esquinas redondeadas 8–12px | Redondeado, no sharp ni 4px default | Traer calidez de la referencia Jane.app sin abandonar el registro sobrio |
| Acento saturado sobre base neutra | Neutros + un solo acento vivo | Balance entre "sobrio/discreto" (Q3-Q4) y la calidez deseada (Jane.app) |
| Animación mínima | Casi estático | Registro clínico serio, sin distracciones; prioridad en carga rápida de datos |
| Dark mode | Más adelante, no ahora | Prioridad actual es el modo claro; se deja la puerta abierta vía tokens |

## Ruled Out
_Direcciones explícitamente rechazadas durante esta sesión. No volver a proponerlas sin reabrir la decisión._

| Direction | Why it was rejected |
|-----------|-------------------|
| Paleta completa de colores | Se prefirió un solo acento + neutros — más sofisticado y enfocado para una app de gestión clínica |
| Animación expresiva | Conflictúa con "sobrio/discreto"; se eligió el nivel mínimo |
| Esquinas sin redondeo (sharp) o solo 4px default | Se descartó a favor de 8-12px para traer la calidez de la referencia Jane.app |

## Open Questions
- Escalado a multiusuario (recepción cargando turnos): sin definir todavía cómo afecta roles/permisos en la UI — retomar cuando se planifique esa fase.
- Tipografía específica (qué fuente sans geométrica exacta) y valores finales de tokens: a definir en `/tokens`.
- Interacción clave a pulir con `/animate`: sin definir, dado que el nivel de animación es mínimo por ahora.
