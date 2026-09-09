import { useEffect, useState, type FormEvent } from "react";
import { listPatients } from "../../api/patients";
import type { IPatient } from "../../types/patient";
import type { IAppointment, IAppointmentPayload } from "../../types/appointment";
import { dayKey, toTimeInputValue } from "../../lib/calendarDates";

const DEFAULT_DURATION_MINUTES = 30;
const DEFAULT_TIME = "09:00";

interface IAppointmentFormProps {
  initialValues?: IAppointment;
  /** Fecha a preseleccionar al crear un turno nuevo (por ej. el día enfocado en el calendario) */
  defaultDate?: Date;
  onSubmit: (payload: IAppointmentPayload) => Promise<void>;
  onCancel: () => void;
}

export const AppointmentForm = ({
  initialValues,
  defaultDate,
  onSubmit,
  onCancel,
}: IAppointmentFormProps) => {
  const isEditing = Boolean(initialValues);

  const [patientId, setPatientId] = useState(initialValues?.patientId ?? "");
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(!isEditing);
  const [date, setDate] = useState(
    dayKey(initialValues ? new Date(initialValues.startsAt) : defaultDate ?? new Date())
  );
  const [time, setTime] = useState(
    initialValues ? toTimeInputValue(new Date(initialValues.startsAt)) : DEFAULT_TIME
  );
  const [durationMinutes, setDurationMinutes] = useState(() => {
    if (!initialValues) return DEFAULT_DURATION_MINUTES;
    const start = new Date(initialValues.startsAt);
    const end = new Date(initialValues.endsAt);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  });
  const [reason, setReason] = useState(initialValues?.reason ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    listPatients()
      .then(setPatients)
      .finally(() => setIsLoadingPatients(false));
  }, [isEditing]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const startsAt = new Date(`${date}T${time}`).toISOString();
      await onSubmit({
        patientId,
        startsAt,
        durationMinutes: Number(durationMinutes),
        ...(reason ? { reason } : {}),
        ...(notes ? { notes } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el turno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-border-subtle bg-surface p-6 sm:grid-cols-2"
    >
      {isEditing ? (
        <p className="text-sm text-text-secondary sm:col-span-2">
          Paciente:{" "}
          <span className="font-medium text-text">
            {initialValues!.patient.firstName} {initialValues!.patient.lastName}
          </span>
        </p>
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor="patientId" className="mb-1 block text-sm font-medium text-text-secondary">
            Paciente
          </label>
          <select
            id="patientId"
            required
            disabled={isLoadingPatients}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none disabled:opacity-50"
          >
            <option value="" disabled>
              {isLoadingPatients ? "Cargando pacientes..." : "Seleccioná un paciente"}
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.lastName}, {patient.firstName} (DNI {patient.dni})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-text-secondary">
          Fecha
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="time" className="mb-1 block text-sm font-medium text-text-secondary">
          Hora
        </label>
        <input
          id="time"
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="durationMinutes" className="mb-1 block text-sm font-medium text-text-secondary">
          Duración (minutos)
        </label>
        <input
          id="durationMinutes"
          type="number"
          required
          min={5}
          max={480}
          step={5}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-medium text-text-secondary">
          Motivo (opcional)
        </label>
        <input
          id="reason"
          maxLength={255}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-text-secondary">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}

      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-confirm transition-colors px-4 py-2 text-sm font-medium text-confirm-foreground hover:bg-confirm-hover hover:text-confirm-hover-foreground active:bg-confirm-active active:text-confirm-hover-foreground disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
