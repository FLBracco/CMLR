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
- **Specific starting point** (confirmado, ver `frontend/src/index.css`):
  - primary/accent, reposo: fill `#C7D2FE` (índigo pastel) + texto `#312E81`. Elegido por el usuario mirando una paleta comparativa en vivo (8 familias × pastel/sólido) después de que terracota, ámbar y rosa no convencieran.
  - primary/accent, hover: fill `#4F46E5` (índigo sólido) + texto blanco, con transición suave — el botón se "rellena" sólido al pasar el mouse, en vez de quedar pastel todo el tiempo.
  - border-focus (foco de inputs): `#EC4899` (rosa vivo), sigue siendo un tono más saturado que el fill de los botones porque un borde no tiene la restricción de contraste de texto-sobre-fondo
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

### Roles de botón (color por función, no decorativo)
| Rol | Color | Dónde |
|---|---|---|
| Crear / navegar / acción principal | Índigo — pastel en reposo, sólido en `:hover` | "Nuevo paciente", "Nueva consulta", ítem activo del sidebar, avatar, "Ingresar", "Crear cuenta" |
| Confirmar / guardar dentro de un formulario | Azul, sólido siempre (no pastel) — `#2563EB`, más oscuro en hover/active | "Guardar", "Guardar cambios" (siempre que hay un botón de Cancelar al lado, o es el único submit de un form de edición) |
| Cancelar / cerrar | Neutro (borde, sin fill) | "Cancelar", "Cerrar", "Editar paciente"/"Cerrar", y el toggle "Nuevo paciente"↔"Cerrar formulario" (cambia de índigo a neutro según el estado) |
| Cerrar sesión | Rojo suave — fondo/borde pálidos (`red-50`/`red-200`), ícono y texto en `--color-destructive` (`red-600`, el mínimo que da 4.5:1 legible) | Botón "Cerrar sesión" del sidebar. No es destructivo (no borra nada), pero tampoco es un cancelar cualquiera — se lo distingue con un rojo apagado, no el rojo fuerte de una acción irreversible |

**Por qué:** el botón que alterna "Nuevo paciente"/"Nueva consulta" ↔ "Cerrar formulario" se quedaba pintado de índigo aunque en el estado abierto ya significaba "cancelar", no "crear" — el color dejó de comunicar el rol real de la acción. Se corrigió para que el color siga el significado, no el componente.

## Layout / Navigation
- **Estructura:** sidebar de navegación persistente en desktop (colapsa a drawer con hamburguesa en mobile), en vez de un header horizontal simple.
- **Ítems reales:** Pacientes (lista + búsqueda), Perfil (editar datos propios), Suscripción (estado de la cuenta: pendiente/activa/desactivada, con badge en el sidebar cuando no está activa).
- **Ítems "Próximamente"** (visibles pero deshabilitados, sin feature real detrás todavía): Calendario — proyecto aparte (turnos), no ajuste de diseño.
- **Acción rápida:** "Nuevo paciente" fijo en el sidebar (disponible desde cualquier pantalla, no solo desde el dashboard).

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
| Color de acento (superseded 3x) | ~~Terracota~~ → ~~Ámbar~~ → ~~Rosa claro~~ → Índigo/violeta | Terracota, ámbar y rosa no convencieron; se armó una paleta comparativa en vivo y el usuario eligió índigo/violeta mirándola directamente en vez de por descripción de texto |
| Estilo de botón primario | Pastel en reposo (`#C7D2FE`/`#312E81`) → sólido al pasar el mouse (`#4F46E5`/blanco), con transición suave | El usuario quería mantener el pastel pero que se "rellene" sólido en hover, no un pastel más oscuro |
| Layout de navegación | Header simple → sidebar (persistente en desktop, drawer en mobile) | El usuario quería más estructura de navegación (Perfil, Calendario, Suscripción) a medida que el producto crece |
| Colores de estado de suscripción (Pendiente/Activa/Desactivada) | Verde/ámbar/rojo directos de Tailwind (`amber-*`, `green-*`, `red-*`), sin token semántico propio | Feature de SuperAdmin/suscripciones (backend) necesitaba un badge de estado ya; no había tiempo/alcance para formalizar un rol semántico "estado" en el sistema de tokens — queda como pendiente en Open Questions |

## Ruled Out
_Direcciones explícitamente rechazadas durante esta sesión. No volver a proponerlas sin reabrir la decisión._

| Direction | Why it was rejected |
|-----------|-------------------|
| ~~Paleta completa de colores~~ (reabierto) | Se prefirió inicialmente un solo acento + neutros. Reabierto más adelante: se sumó un segundo acento (azul, solo para botones de confirmar/guardar) — sigue sin ser una "paleta completa", es un rol semántico adicional (crear=índigo, confirmar=azul, neutro=cancelar), no color decorativo |
| Animación expresiva | Conflictúa con "sobrio/discreto"; se eligió el nivel mínimo |
| Esquinas sin redondeo (sharp) o solo 4px default | Se descartó a favor de 8-12px para traer la calidez de la referencia Jane.app |
| Rojo para "Cancelar" | El usuario lo propuso; se explicó que la convención es reservar rojo para acciones destructivas/irreversibles (eliminar), no para cancelar/cerrar un formulario que solo descarta cambios sin guardar — usarlo ahí mezclaría la señal con `--color-destructive` (ya usado en mensajes de error) y generaría dudas donde no las debería haber. Cancelar queda neutro; el rojo se reserva para el día que exista una acción tipo "Eliminar paciente" |

## Open Questions
- Escalado a multiusuario (recepción cargando turnos): sin definir todavía cómo afecta roles/permisos en la UI — retomar cuando se planifique esa fase.
- Tipografía específica (qué fuente sans geométrica exacta) y valores finales de tokens: a definir en `/tokens`.
- Interacción clave a pulir con `/animate`: sin definir, dado que el nivel de animación es mínimo por ahora.
- Rol semántico de "estado" (pendiente/activo/desactivado) sin token propio: hoy el badge de suscripción y el panel de SuperAdmin usan verde/ámbar/rojo directos de Tailwind. Formalizar como tokens (`--color-status-*`) cuando se audite el sistema de diseño completo.
