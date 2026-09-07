import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { listAppointments } from "../api/appointments";
import { ApiError } from "../api/client";
import type { AppointmentStatus, IAppointment } from "../types/appointment";

const UPCOMING_RANGE_DAYS = 30;

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Ausente",
};

const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-confirm text-confirm-foreground",
  COMPLETED: "bg-surface-hover text-text-muted",
  CANCELLED: "bg-red-50 text-destructive line-through",
  NO_SHOW: "bg-red-50 text-destructive",
};

const formatDateTime = (isoDate: string): string =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

export const CalendarPage = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcoming = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const from = new Date();
      const to = new Date(from.getTime() + UPCOMING_RANGE_DAYS * 24 * 60 * 60 * 1000);
      const result = await listAppointments(from.toISOString(), to.toISOString());
      setAppointments(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cargar la agenda."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold text-text">Calendario</h2>
        <p className="mt-1 text-sm text-text-muted">
          Próximos turnos de los siguientes {UPCOMING_RANGE_DAYS} días.
        </p>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-text-muted">Cargando turnos...</p>
          ) : appointments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-text-secondary">
                No hay turnos en los próximos {UPCOMING_RANGE_DAYS} días.
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Los turnos que cargues van a aparecer acá.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {appointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="rounded-lg border border-border-subtle bg-surface p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text">
                      {formatDateTime(appointment.startsAt)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[appointment.status]}`}
                    >
                      {STATUS_LABELS[appointment.status]}
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
};
