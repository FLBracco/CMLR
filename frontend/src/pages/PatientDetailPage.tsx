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

  const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(`${isoDate}T00:00:00`)
    );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-3xl p-6">
        <Link to="/dashboard" className="text-sm text-text-tertiary underline">
          ← Volver al dashboard
        </Link>

        {isLoading && <p className="mt-4 text-sm text-text-muted">Cargando...</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {patient && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-text">
                {patient.firstName} {patient.lastName}
              </h2>
              <button
                onClick={() => setIsEditingPatient((current) => !current)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover"
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
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border-subtle bg-surface p-4 text-sm">
                <div>
                  <dt className="text-text-muted">DNI</dt>
                  <dd className="text-text">{patient.dni}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Fecha de nacimiento</dt>
                  <dd className="text-text">{formatDate(patient.birthDate)}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Teléfono</dt>
                  <dd className="text-text">{patient.phone}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Email</dt>
                  <dd className="text-text">{patient.email ?? "—"}</dd>
                </div>
              </dl>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-text">Historial de consultas</h3>
              <button
                onClick={() => setIsCreatingConsultation((current) => !current)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
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
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-medium text-text-secondary">
                    Todavía no hay consultas registradas.
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    Usá el botón "Nueva consulta" para cargar la primera.
                  </p>
                </div>
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
                      className="rounded-lg border border-border-subtle bg-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text">
                          {formatDate(consultation.consultationDate)}
                        </span>
                        <button
                          onClick={() => setEditingConsultationId(consultation.id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover"
                        >
                          Editar
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-text">
                        <span className="font-medium">Observaciones: </span>
                        {consultation.observations}
                      </p>
                      {consultation.diagnosis && (
                        <p className="mt-1 text-sm text-text">
                          <span className="font-medium">Diagnóstico: </span>
                          {consultation.diagnosis}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-text">
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
