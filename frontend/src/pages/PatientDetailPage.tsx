import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PatientForm } from "../components/PatientForm";
import { ConsultationForm } from "../components/ConsultationForm";
import { getPatient, updatePatient } from "../api/patients";
import {
  createConsultation,
  listConsultations,
  updateConsultation,
} from "../api/consultations";
import { ApiError } from "../api/client";
import type { IPatient, IPatientPayload } from "../types/patient";
import type { IConsultation, IConsultationPayload } from "../types/consultation";

export const PatientDetailPage = () => {
  const { patientId } = useParams<{ patientId: string }>();

  const [patient, setPatient] = useState<IPatient | null>(null);
  const [consultations, setConsultations] = useState<IConsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
  const [editingConsultationId, setEditingConsultationId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [patientResult, consultationsResult] = await Promise.all([
        getPatient(patientId),
        listConsultations(patientId),
      ]);
      setPatient(patientResult);
      setConsultations(consultationsResult);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cargar la ficha del paciente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePatient = async (payload: IPatientPayload) => {
    if (!patientId) return;
    const updated = await updatePatient(patientId, payload);
    setPatient(updated);
    setIsEditingPatient(false);
  };

  const handleCreateConsultation = async (payload: IConsultationPayload) => {
    if (!patientId) return;
    const created = await createConsultation(patientId, payload);
    setConsultations((current) => [...current, created]);
    setIsCreatingConsultation(false);
  };

  const handleUpdateConsultation = async (
    id: string,
    payload: IConsultationPayload
  ) => {
    const updated = await updateConsultation(id, payload);
    setConsultations((current) =>
      current.map((consultation) => (consultation.id === id ? updated : consultation))
    );
    setEditingConsultationId(null);
  };

  const orderedConsultations = [...consultations].reverse();

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl p-6">
        <Link to="/dashboard" className="text-sm text-slate-600 underline">
          ← Volver al dashboard
        </Link>

        {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {patient && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-800">
                {patient.firstName} {patient.lastName}
              </h2>
              <button
                onClick={() => setIsEditingPatient((current) => !current)}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                {isEditingPatient ? "Cerrar" : "Editar paciente"}
              </button>
            </div>

            {isEditingPatient ? (
              <div className="mt-4">
                <PatientForm
                  initialValues={patient}
                  onSubmit={handleUpdatePatient}
                  onCancel={() => setIsEditingPatient(false)}
                />
              </div>
            ) : (
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <div>
                  <dt className="text-slate-500">DNI</dt>
                  <dd className="text-slate-800">{patient.dni}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Fecha de nacimiento</dt>
                  <dd className="text-slate-800">{patient.birthDate}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Teléfono</dt>
                  <dd className="text-slate-800">{patient.phone}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-800">{patient.email ?? "—"}</dd>
                </div>
              </dl>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-800">Historial de consultas</h3>
              <button
                onClick={() => setIsCreatingConsultation((current) => !current)}
                className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                {isCreatingConsultation ? "Cerrar formulario" : "Nueva consulta"}
              </button>
            </div>

            {isCreatingConsultation && (
              <div className="mt-4">
                <ConsultationForm
                  onSubmit={handleCreateConsultation}
                  onCancel={() => setIsCreatingConsultation(false)}
                />
              </div>
            )}

            <div className="mt-4 space-y-3">
              {orderedConsultations.length === 0 ? (
                <p className="text-sm text-slate-500">Todavía no hay consultas registradas.</p>
              ) : (
                orderedConsultations.map((consultation) =>
                  editingConsultationId === consultation.id ? (
                    <ConsultationForm
                      key={consultation.id}
                      initialValues={consultation}
                      onSubmit={(payload) => handleUpdateConsultation(consultation.id, payload)}
                      onCancel={() => setEditingConsultationId(null)}
                    />
                  ) : (
                    <div
                      key={consultation.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800">
                          {consultation.consultationDate}
                        </span>
                        <button
                          onClick={() => setEditingConsultationId(consultation.id)}
                          className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          Editar
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">Observaciones: </span>
                        {consultation.observations}
                      </p>
                      {consultation.diagnosis && (
                        <p className="mt-1 text-sm text-slate-600">
                          <span className="font-medium">Diagnóstico: </span>
                          {consultation.diagnosis}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium">Plan de seguimiento: </span>
                        {consultation.followUpPlan}
                      </p>
                    </div>
                  )
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
