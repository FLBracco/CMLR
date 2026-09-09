import type { AppointmentStatus } from "../../types/appointment";

export type AppointmentAction = "CONFIRM" | "COMPLETE" | "NO_SHOW" | "CANCEL";

export const ACTION_TO_STATUS: Record<AppointmentAction, AppointmentStatus> = {
  CONFIRM: "CONFIRMED",
  COMPLETE: "COMPLETED",
  NO_SHOW: "NO_SHOW",
  CANCEL: "CANCELLED",
};

// Espeja ALLOWED_TRANSITIONS de appointment.service.ts (backend, fuente de
// verdad). Si esas reglas cambian, actualizar acá también.
const AVAILABLE_ACTIONS: Record<AppointmentStatus, AppointmentAction[]> = {
  PENDING: ["CONFIRM", "COMPLETE", "NO_SHOW", "CANCEL"],
  CONFIRMED: ["COMPLETE", "NO_SHOW", "CANCEL"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

// El backend rechaza COMPLETED/NO_SHOW si el turno todavia no arranco
// (startsAt > now, no endsAt) — mismo criterio acá para no ofrecer una accion
// que el server va a rechazar con 400.
const REQUIRES_STARTED: ReadonlySet<AppointmentAction> = new Set(["COMPLETE", "NO_SHOW"]);

export const getAvailableActions = (
  status: AppointmentStatus,
  startsAt: Date,
  now: Date
): AppointmentAction[] => {
  const hasStarted = startsAt.getTime() <= now.getTime();
  return AVAILABLE_ACTIONS[status].filter(
    (action) => !REQUIRES_STARTED.has(action) || hasStarted
  );
};
