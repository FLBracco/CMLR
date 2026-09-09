import type { IAppointment } from "../../types/appointment";
import { STATUS_COLORS } from "./appointmentStatusColors";
import { dayKey, formatTime, isSameDay, isSameMonth } from "../../lib/calendarDates";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_VISIBLE_PER_DAY = 3;

interface IMonthGridProps {
  /** 42 días (6 semanas) */
  days: Date[];
  monthAnchor: Date;
  appointmentsByDay: Map<string, IAppointment[]>;
  today: Date;
  onSelectDay: (day: Date) => void;
}

export const MonthGrid = ({
  days,
  monthAnchor,
  appointmentsByDay,
  today,
  onSelectDay,
}: IMonthGridProps) => (
  <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
    <div className="grid grid-cols-7 border-b border-border-subtle">
      {DAY_LABELS.map((label) => (
        <div
          key={label}
          className="px-2 py-2 text-center text-xs font-medium text-text-muted"
        >
          {label}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-7">
      {days.map((day) => {
        const key = dayKey(day);
        const dayAppointments = appointmentsByDay.get(key) ?? [];
        const visible = dayAppointments.slice(0, MAX_VISIBLE_PER_DAY);
        const hiddenCount = dayAppointments.length - visible.length;
        const inCurrentMonth = isSameMonth(day, monthAnchor);

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDay(day)}
            className={`min-h-[96px] border-b border-l border-border-subtle p-1.5 text-left hover:bg-surface-hover ${
              inCurrentMonth ? "" : "bg-background"
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                isSameDay(day, today)
                  ? "bg-primary font-semibold text-primary-foreground"
                  : inCurrentMonth
                    ? "text-text-secondary"
                    : "text-text-muted"
              }`}
            >
              {day.getDate()}
            </span>

            <div className="mt-1 space-y-1">
              {visible.map((appointment) => (
                <span
                  key={appointment.id}
                  className={`block truncate rounded border px-1 py-0.5 text-[10px] ${STATUS_COLORS[appointment.status].chip}`}
                >
                  {formatTime(new Date(appointment.startsAt))}{" "}
                  {appointment.patient.lastName}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="block text-[10px] text-text-muted">
                  +{hiddenCount} más
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
