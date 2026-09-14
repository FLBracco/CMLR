import { Link } from "react-router-dom";
import type { IConsultationWithPatient } from "../../types/consultation";

interface IDayConsultationsProps {
  consultations: IConsultationWithPatient[];
  error?: string | null;
}

// Sección de solo lectura: historial clínico ya cargado ese día, separado
// de los turnos agendados. Sin acciones (editar/cancelar/completar no
// aplican acá) y sin horario (una consulta no tiene hora, solo fecha).
export const DayConsultations = ({ consultations, error }: IDayConsultationsProps) => {
  if (error) {
    return <p className="mt-4 text-sm text-destructive">{error}</p>;
  }

  if (consultations.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-border-subtle pt-4">
      <p className="text-sm font-medium text-text-secondary">
        Consultas registradas ({consultations.length})
      </p>
      <p className="mt-0.5 text-xs text-text-muted">
        Historial clínico cargado en este día — no son turnos agendados.
      </p>

      <ul className="mt-3 space-y-3" aria-label="Consultas registradas del día">
        {consultations.map((consultation) => (
          <li key={consultation.id} className="rounded-lg border border-border-subtle bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                to={`/pacientes/${consultation.patient.id}`}
                className="text-sm text-text-tertiary underline"
              >
                {consultation.patient.firstName} {consultation.patient.lastName}
              </Link>
              <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-text-tertiary">
                Consulta
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-text-muted">{consultation.observations}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
