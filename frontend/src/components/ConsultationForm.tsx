import { useState, type FormEvent } from "react";
import type { IConsultation, IConsultationPayload } from "../types/consultation";

interface IConsultationFormProps {
  initialValues?: IConsultation;
  onSubmit: (payload: IConsultationPayload) => Promise<void>;
  onCancel: () => void;
}

export const ConsultationForm = ({
  initialValues,
  onSubmit,
  onCancel,
}: IConsultationFormProps) => {
  const [consultationDate, setConsultationDate] = useState(
    initialValues?.consultationDate ?? ""
  );
  const [observations, setObservations] = useState(
    initialValues?.observations ?? ""
  );
  const [diagnosis, setDiagnosis] = useState(initialValues?.diagnosis ?? "");
  const [followUpPlan, setFollowUpPlan] = useState(
    initialValues?.followUpPlan ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        consultationDate,
        observations,
        followUpPlan,
        ...(diagnosis ? { diagnosis } : {}),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la consulta."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="consultationDate" className="mb-1 block text-sm font-medium text-slate-700">
          Fecha de la consulta
        </label>
        <input
          id="consultationDate"
          type="date"
          required
          value={consultationDate}
          onChange={(e) => setConsultationDate(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:max-w-xs"
        />
      </div>

      <div>
        <label htmlFor="observations" className="mb-1 block text-sm font-medium text-slate-700">
          Observaciones
        </label>
        <textarea
          id="observations"
          required
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="diagnosis" className="mb-1 block text-sm font-medium text-slate-700">
          Diagnóstico (opcional)
        </label>
        <textarea
          id="diagnosis"
          rows={2}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="followUpPlan" className="mb-1 block text-sm font-medium text-slate-700">
          Plan de seguimiento
        </label>
        <textarea
          id="followUpPlan"
          required
          rows={2}
          value={followUpPlan}
          onChange={(e) => setFollowUpPlan(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
