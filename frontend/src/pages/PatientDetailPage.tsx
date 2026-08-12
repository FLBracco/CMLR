import { Link, useParams } from "react-router-dom";

export const PatientDetailPage = () => {
  const { patientId } = useParams<{ patientId: string }>();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Link to="/dashboard" className="text-sm text-slate-600 underline">
        ← Volver al dashboard
      </Link>

      <p className="mt-4 text-sm text-slate-500">
        Ficha del paciente {patientId} — pendiente (Fase 6).
      </p>
    </div>
  );
};
