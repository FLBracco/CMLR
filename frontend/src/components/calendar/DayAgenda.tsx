import { Link } from "react-router-dom";
import type { IAppointment, IAppointmentPayload } from "../../types/appointment";
import { STATUS_COLORS } from "./appointmentStatusColors";
import { AppointmentForm } from "./AppointmentForm";
import { formatDayHeader, formatTime } from "../../lib/calendarDates";

// Un turno completado, cancelado o ausente no se puede editar (regla del backend).
const EDITABLE_STATUSES = new Set(["PENDING", "CONFIRMED"]);

interface IDayAgendaProps {
  appointments: IAppointment[];
  emptyMessage: string;
  editingAppointmentId?: string | null;
  onStartEdit?: (appointment: IAppointment) => void;
  onSubmitEdit?: (id: string, payload: IAppointmentPayload) => Promise<void>;
  onCancelEdit?: () => void;
}

export const DayAgenda = ({
  appointments,
  emptyMessage,
  editingAppointmentId,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
}: IDayAgendaProps) => {
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {appointments.map((appointment) => {
        if (appointment.id === editingAppointmentId && onSubmitEdit && onCancelEdit) {
          return (
            <li key={appointment.id}>
              <AppointmentForm
                initialValues={appointment}
                onSubmit={(payload) => onSubmitEdit(appointment.id, payload)}
                onCancel={onCancelEdit}
              />
            </li>
          );
        }

        const colors = STATUS_COLORS[appointment.status];
        const startsAt = new Date(appointment.startsAt);

        return (
          <li
            key={appointment.id}
            className="rounded-lg border border-border-subtle bg-surface p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-text">
                {formatDayHeader(startsAt)}, {formatTime(startsAt)}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}
                >
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
            {appointment.reason && (
              <p className="mt-1 text-sm text-text-muted">{appointment.reason}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
};
