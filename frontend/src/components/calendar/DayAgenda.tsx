import { Link } from "react-router-dom";
import type { IAppointment } from "../../types/appointment";
import { STATUS_COLORS } from "./appointmentStatusColors";
import { formatDayHeader, formatTime } from "../../lib/calendarDates";

interface IDayAgendaProps {
  appointments: IAppointment[];
  emptyMessage: string;
}

export const DayAgenda = ({ appointments, emptyMessage }: IDayAgendaProps) => {
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
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}
              >
                {colors.label}
              </span>
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
