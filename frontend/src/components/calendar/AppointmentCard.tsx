import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { AppointmentStatus, IAppointment } from "../../types/appointment";
import { STATUS_COLORS } from "./appointmentStatusColors";
import { ACTION_TO_STATUS, getAvailableActions, type AppointmentAction } from "./appointmentTransitions";
import { formatDayHeader, formatTime } from "../../lib/calendarDates";

// Un turno completado, cancelado o ausente no se puede editar (regla del backend).
const EDITABLE_STATUSES = new Set(["PENDING", "CONFIRMED"]);

const ACTION_LABELS: Record<AppointmentAction, string> = {
  CONFIRM: "Confirmar",
  COMPLETE: "Completar",
  NO_SHOW: "Ausente",
  CANCEL: "Cancelar",
};

const ACTION_CLASSES: Record<AppointmentAction, string> = {
  CONFIRM:
    "rounded-lg bg-confirm px-3 py-1.5 text-xs font-medium text-confirm-foreground hover:bg-confirm-hover disabled:opacity-50",
  COMPLETE:
    "rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50",
  NO_SHOW:
    "rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-surface-hover disabled:opacity-50",
  CANCEL:
    "rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-red-100 disabled:opacity-50",
};

interface IAppointmentCardProps {
  appointment: IAppointment;
  /** Reloj de referencia para habilitar Completar/Ausente; se pasa desde afuera para que sea reactivo */
  now: Date;
  onStartEdit?: (appointment: IAppointment) => void;
  onUpdateStatus?: (
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string
  ) => Promise<void>;
}

export const AppointmentCard = ({
  appointment,
  now,
  onStartEdit,
  onUpdateStatus,
}: IAppointmentCardProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = STATUS_COLORS[appointment.status];
  const startsAt = new Date(appointment.startsAt);
  const actions = onUpdateStatus ? getAvailableActions(appointment.status, startsAt, now) : [];

  const runAction = async (action: AppointmentAction, reason?: string) => {
    if (!onUpdateStatus) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onUpdateStatus(appointment.id, ACTION_TO_STATUS[action], reason);
      setIsCancelling(false);
      setCancellationReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el turno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = cancellationReason.trim();
    if (!trimmed) return;
    runAction("CANCEL", trimmed);
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-text">
          {formatDayHeader(startsAt)}, {formatTime(startsAt)}
        </span>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>
            {colors.label}
          </span>
          {onStartEdit && EDITABLE_STATUSES.has(appointment.status) && (
            <button
              type="button"
              onClick={() => onStartEdit(appointment)}
              className="rounded-lg border border-border px-2 py-1 text-xs text-text-secondary hover:bg-surface-hover"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <Link
        to={`/pacientes/${appointment.patient.id}`}
        className="mt-2 inline-block text-sm text-text-tertiary underline"
      >
        {appointment.patient.firstName} {appointment.patient.lastName}
      </Link>
      {appointment.reason && <p className="mt-1 text-sm text-text-muted">{appointment.reason}</p>}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {isCancelling ? (
        <form onSubmit={handleCancelSubmit} className="mt-3 border-t border-border-subtle pt-3">
          <label
            htmlFor={`cancel-reason-${appointment.id}`}
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            Motivo de la cancelación
          </label>
          <textarea
            id={`cancel-reason-${appointment.id}`}
            required
            maxLength={500}
            rows={2}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !cancellationReason.trim()}
              className={ACTION_CLASSES.CANCEL}
            >
              {isSubmitting ? "Cancelando..." : "Confirmar cancelación"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCancelling(false);
                setCancellationReason("");
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover"
            >
              Volver
            </button>
          </div>
        </form>
      ) : (
        actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
            {actions.map((action) =>
              action === "CANCEL" ? (
                <button
                  key={action}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCancelling(true)}
                  className={ACTION_CLASSES[action]}
                >
                  {ACTION_LABELS[action]}
                </button>
              ) : (
                <button
                  key={action}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => runAction(action)}
                  className={ACTION_CLASSES[action]}
                >
                  {isSubmitting ? "..." : ACTION_LABELS[action]}
                </button>
              )
            )}
          </div>
        )
      )}
    </div>
  );
};
