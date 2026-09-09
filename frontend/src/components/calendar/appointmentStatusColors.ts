import type { AppointmentStatus } from "../../types/appointment";

interface IStatusColor {
  label: string;
  /** Pill de estado (listas tipo agenda) */
  badge: string;
  /** Bloque compacto (grillas de semana/mes) */
  chip: string;
}

// Colores directos de Tailwind, no tokens semánticos propios — mismo criterio
// que el badge de suscripción y el panel de SuperAdmin (ver DESIGN-BRIEF.md,
// "Rol semántico de estado" en Open Questions).
export const STATUS_COLORS: Record<AppointmentStatus, IStatusColor> = {
  PENDING: {
    label: "Pendiente",
    badge: "bg-amber-50 text-amber-700",
    chip: "border-amber-300 bg-amber-50 text-amber-800",
  },
  CONFIRMED: {
    label: "Confirmado",
    badge: "bg-confirm text-confirm-foreground",
    chip: "border-confirm/40 bg-confirm/10 text-confirm-active",
  },
  COMPLETED: {
    label: "Completado",
    badge: "bg-surface-hover text-text-muted",
    chip: "border-border-subtle bg-surface-hover text-text-muted",
  },
  CANCELLED: {
    label: "Cancelado",
    badge: "bg-red-50 text-destructive line-through",
    chip: "border-red-200 bg-red-50 text-destructive line-through",
  },
  NO_SHOW: {
    label: "Ausente",
    badge: "bg-red-50 text-destructive",
    chip: "border-red-200 bg-red-50 text-destructive",
  },
};
