import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { CalendarToolbar, type CalendarViewMode } from "../components/calendar/CalendarToolbar";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { DayAgenda } from "../components/calendar/DayAgenda";
import { AppointmentForm } from "../components/calendar/AppointmentForm";
import { DayConsultations } from "../components/calendar/DayConsultations";
import {
  createAppointment,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../api/appointments";
import { listConsultationsByRange } from "../api/consultations";
import { ApiError } from "../api/client";
import type { AppointmentStatus, IAppointment, IAppointmentPayload } from "../types/appointment";
import type { IConsultationWithPatient } from "../types/consultation";
import {
  addDays,
  dayKey,
  formatDayHeader,
  formatMonthYear,
  getMonthGridDays,
  startOfDay,
  startOfMonth,
} from "../lib/calendarDates";

export const CalendarPage = () => {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [consultations, setConsultations] = useState<IConsultationWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultationsError, setConsultationsError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Reloj de referencia para habilitar Completar/Ausente cuando un turno arranca,
  // sin esperar a que otra cosa dispare un re-render.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const monthDays = useMemo(() => getMonthGridDays(anchor), [anchor]);

  const { rangeFrom, rangeTo } = useMemo(() => {
    if (view === "day") {
      return { rangeFrom: startOfDay(anchor), rangeTo: addDays(anchor, 1) };
    }
    return { rangeFrom: monthDays[0]!, rangeTo: addDays(monthDays[41]!, 1) };
  }, [view, anchor, monthDays]);

  // Turnos y consultas se piden en paralelo con `allSettled`, no `all`: si el
  // listado de consultas falla, la agenda de turnos (contenido primario) tiene
  // que seguir renderizando igual — son dos recursos independientes con
  // errores independientes (ver `error` vs. `consultationsError`).
  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConsultationsError(null);

    const from = dayKey(rangeFrom);
    const to = dayKey(addDays(rangeTo, -1));

    const [appointmentsResult, consultationsResult] = await Promise.allSettled([
      listAppointments(rangeFrom.toISOString(), rangeTo.toISOString()),
      listConsultationsByRange(from, to),
    ]);

    if (appointmentsResult.status === "fulfilled") {
      setAppointments(appointmentsResult.value);
    } else {
      setError(
        appointmentsResult.reason instanceof ApiError
          ? appointmentsResult.reason.message
          : "No se pudo cargar la agenda."
      );
    }

    if (consultationsResult.status === "fulfilled") {
      setConsultations(consultationsResult.value);
    } else {
      setConsultationsError(
        consultationsResult.reason instanceof ApiError
          ? consultationsResult.reason.message
          : "No se pudieron cargar las consultas registradas."
      );
    }

    setIsLoading(false);
  }, [rangeFrom, rangeTo]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handleCreate = async (payload: IAppointmentPayload) => {
    await createAppointment(payload);
    setIsCreating(false);
    await fetchCalendar();
  };

  const handleStartEdit = (appointment: IAppointment) => setEditingAppointmentId(appointment.id);

  const handleCancelEdit = () => setEditingAppointmentId(null);

  const handleSubmitEdit = async (id: string, payload: IAppointmentPayload) => {
    const { patientId: _patientId, ...updatePayload } = payload;
    await updateAppointment(id, updatePayload);
    setEditingAppointmentId(null);
    await fetchCalendar();
  };

  const handleUpdateStatus = async (
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string
  ) => {
    await updateAppointmentStatus(id, { status, ...(cancellationReason && { cancellationReason }) });
    await fetchCalendar();
  };

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

  const dayAppointments = useMemo(
    () => appointmentsByDayMap.get(dayKey(anchor)) ?? [],
    [appointmentsByDayMap, anchor]
  );

  // `consultation.consultationDate` ya llega como "YYYY-MM-DD" (fecha
  // calendario del profesional, sin hora) — misma forma que produce
  // `dayKey()`, así que se puede usar directo como clave sin reparsear.
  const consultationsByDayMap = useMemo(() => {
    const map = new Map<string, IConsultationWithPatient[]>();
    for (const consultation of consultations) {
      const list = map.get(consultation.consultationDate) ?? [];
      list.push(consultation);
      map.set(consultation.consultationDate, list);
    }
    return map;
  }, [consultations]);

  const dayConsultations = useMemo(
    () => consultationsByDayMap.get(dayKey(anchor)) ?? [],
    [consultationsByDayMap, anchor]
  );

  // Solo para el puntito indicador de la vista mes — ninguna acción
  // depende de esto, así que un conteo simple alcanza.
  const consultationCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const [key, list] of consultationsByDayMap) {
      map.set(key, list.length);
    }
    return map;
  }, [consultationsByDayMap]);

  const label = view === "day" ? formatDayHeader(anchor) : formatMonthYear(anchor);

  const handleToday = () => setAnchor(startOfDay(new Date()));

  const handlePrev = () => {
    if (view === "day") setAnchor((current) => addDays(current, -1));
    else setAnchor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (view === "day") setAnchor((current) => addDays(current, 1));
    else setAnchor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-text">Calendario</h2>
          <button
            onClick={() => setIsCreating((current) => !current)}
            className={
              isCreating
                ? "rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                : "rounded-lg bg-primary transition-colors px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground active:bg-primary-active active:text-primary-hover-foreground"
            }
          >
            {isCreating ? "Cerrar formulario" : "Nuevo turno"}
          </button>
        </div>

        {isCreating && (
          <div className="mb-4">
            <AppointmentForm
              defaultDate={anchor}
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        )}

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
              <>
                <DayAgenda
                  appointments={dayAppointments}
                  emptyMessage="No hay turnos para este día."
                  now={now}
                  editingAppointmentId={editingAppointmentId}
                  onStartEdit={handleStartEdit}
                  onSubmitEdit={handleSubmitEdit}
                  onCancelEdit={handleCancelEdit}
                  onUpdateStatus={handleUpdateStatus}
                />
                <DayConsultations
                  consultations={dayConsultations}
                  error={consultationsError}
                />
              </>
            )}

            {view === "month" && (
              <MonthGrid
                days={monthDays}
                monthAnchor={startOfMonth(anchor)}
                appointmentsByDay={appointmentsByDayMap}
                consultationCountByDay={consultationCountByDay}
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
