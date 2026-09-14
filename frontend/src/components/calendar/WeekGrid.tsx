import { Link } from "react-router-dom";
import type { IAppointment } from "../../types/appointment";
import { STATUS_COLORS } from "./appointmentStatusColors";
import { dayKey, formatTime, isSameDay } from "../../lib/calendarDates";

const HOUR_ROW_PX = 56;
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 21;
const MIN_CHIP_HEIGHT_PX = 36;

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface IWeekGridProps {
  /** 7 fechas, lunes a domingo */
  days: Date[];
  /** turnos de cada día, mismo orden/longitud que `days` */
  appointmentsByDay: IAppointment[][];
  /** Cantidad de consultas registradas por día — solo para el puntito indicador, sin acciones */
  consultationCountByDay: Map<string, number>;
  today: Date;
}

const minutesSinceMidnight = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

export const WeekGrid = ({
  days,
  appointmentsByDay,
  consultationCountByDay,
  today,
}: IWeekGridProps) => {
  const boundaryHours = appointmentsByDay.flat().flatMap((appointment) => {
    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);
    const endHour = end.getMinutes() > 0 ? end.getHours() + 1 : end.getHours();
    return [start.getHours(), endHour];
  });

  const startHour = Math.min(DEFAULT_START_HOUR, ...boundaryHours);
  const endHour = Math.max(DEFAULT_END_HOUR, ...boundaryHours);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalMinutes = (endHour - startHour) * 60;
  const gridHeight = hours.length * HOUR_ROW_PX;

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
      <div className="grid min-w-[720px] grid-cols-[56px_repeat(7,1fr)]">
        {/* Encabezado */}
        <div className="border-b border-border-subtle" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`border-b border-l border-border-subtle px-2 py-2 text-center text-sm ${
              isSameDay(day, today)
                ? "border-b-2 border-b-accent-600 font-semibold text-text"
                : "text-text-secondary"
            }`}
          >
            <p>{DAY_LABELS[(day.getDay() + 6) % 7]}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-text-muted">
              {day.getDate()}
              {(consultationCountByDay.get(dayKey(day)) ?? 0) > 0 && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent-500"
                  role="img"
                  aria-label="Consultas registradas este día"
                  title="Consultas registradas este día"
                />
              )}
            </p>
          </div>
        ))}

        {/* Columna de horas */}
        <div className="relative" style={{ height: gridHeight }}>
          {hours.map((hour, i) => (
            <span
              key={hour}
              style={{ top: i * HOUR_ROW_PX }}
              className="absolute right-2 text-[11px] text-text-muted"
            >
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {/* Columnas de días */}
        {days.map((day, dayIndex) => (
          <div
            key={day.toISOString()}
            className="relative border-l border-border-subtle"
            style={{ height: gridHeight }}
          >
            {hours.map((hour, i) => (
              <div
                key={hour}
                style={{ top: i * HOUR_ROW_PX, height: HOUR_ROW_PX }}
                className="absolute left-0 right-0 border-t border-border-subtle"
              />
            ))}

            {(appointmentsByDay[dayIndex] ?? []).map((appointment) => {
              const start = new Date(appointment.startsAt);
              const end = new Date(appointment.endsAt);
              const startOffset = minutesSinceMidnight(start) - startHour * 60;
              const durationMinutes = (end.getTime() - start.getTime()) / 60000;
              const top = (startOffset / totalMinutes) * gridHeight;
              const height = Math.max(
                (durationMinutes / totalMinutes) * gridHeight,
                MIN_CHIP_HEIGHT_PX
              );
              const colors = STATUS_COLORS[appointment.status];

              return (
                <Link
                  key={appointment.id}
                  to={`/pacientes/${appointment.patient.id}`}
                  style={{ top, height }}
                  className={`absolute left-0.5 right-0.5 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight ${colors.chip}`}
                >
                  <p className="truncate font-semibold">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                  <p className="truncate opacity-80">{formatTime(start)}</p>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
