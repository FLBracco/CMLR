import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { CalendarToolbar, type CalendarViewMode } from "../components/calendar/CalendarToolbar";
import { WeekGrid } from "../components/calendar/WeekGrid";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { DayAgenda } from "../components/calendar/DayAgenda";
import { listAppointments } from "../api/appointments";
import { ApiError } from "../api/client";
import type { IAppointment } from "../types/appointment";
import {
  addDays,
  dayKey,
  formatDayHeader,
  formatMonthYear,
  formatWeekRange,
  getMonthGridDays,
  getWeekDays,
  startOfDay,
  startOfMonth,
} from "../lib/calendarDates";

export const CalendarPage = () => {
  const [view, setView] = useState<CalendarViewMode>("week");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const weekDays = useMemo(() => getWeekDays(anchor), [anchor]);
  const monthDays = useMemo(() => getMonthGridDays(anchor), [anchor]);

  const { rangeFrom, rangeTo } = useMemo(() => {
    if (view === "day") {
      return { rangeFrom: startOfDay(anchor), rangeTo: addDays(anchor, 1) };
    }
    if (view === "week") {
      return { rangeFrom: weekDays[0]!, rangeTo: addDays(weekDays[6]!, 1) };
    }
    return { rangeFrom: monthDays[0]!, rangeTo: addDays(monthDays[41]!, 1) };
  }, [view, anchor, weekDays, monthDays]);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listAppointments(
        rangeFrom.toISOString(),
        rangeTo.toISOString()
      );
      setAppointments(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cargar la agenda."
      );
    } finally {
      setIsLoading(false);
    }
  }, [rangeFrom, rangeTo]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const appointmentsByDayMap = useMemo(() => {
    const map = new Map<string, IAppointment[]>();
    for (const appointment of appointments) {
      const key = dayKey(new Date(appointment.startsAt));
      const list = map.get(key) ?? [];
      list.push(appointment);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    return map;
  }, [appointments]);

  const weekAppointmentsByDay = useMemo(
    () => weekDays.map((day) => appointmentsByDayMap.get(dayKey(day)) ?? []),
    [weekDays, appointmentsByDayMap]
  );

  const dayAppointments = useMemo(
    () => appointmentsByDayMap.get(dayKey(anchor)) ?? [],
    [appointmentsByDayMap, anchor]
  );

  const weekFlatAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [appointments]
  );

  const label =
    view === "day"
      ? formatDayHeader(anchor)
      : view === "week"
        ? formatWeekRange(weekDays)
        : formatMonthYear(anchor);

  const handleToday = () => setAnchor(startOfDay(new Date()));

  const handlePrev = () => {
    if (view === "day") setAnchor((current) => addDays(current, -1));
    else if (view === "week") setAnchor((current) => addDays(current, -7));
    else setAnchor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (view === "day") setAnchor((current) => addDays(current, 1));
    else if (view === "week") setAnchor((current) => addDays(current, 7));
    else setAnchor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-2xl font-semibold text-text">Calendario</h2>

        <CalendarToolbar
          view={view}
          onViewChange={setView}
          label={label}
          onToday={handleToday}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {isLoading ? (
          <p className="text-sm text-text-muted">Cargando turnos...</p>
        ) : (
          <>
            {view === "day" && (
              <DayAgenda
                appointments={dayAppointments}
                emptyMessage="No hay turnos para este día."
              />
            )}

            {view === "week" && (
              <>
                <div className="hidden sm:block">
                  <WeekGrid days={weekDays} appointmentsByDay={weekAppointmentsByDay} today={today} />
                </div>
                <div className="sm:hidden">
                  <DayAgenda
                    appointments={weekFlatAppointments}
                    emptyMessage="No hay turnos esta semana."
                  />
                </div>
              </>
            )}

            {view === "month" && (
              <MonthGrid
                days={monthDays}
                monthAnchor={startOfMonth(anchor)}
                appointmentsByDay={appointmentsByDayMap}
                today={today}
                onSelectDay={(day) => {
                  setAnchor(day);
                  setView("day");
                }}
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};
