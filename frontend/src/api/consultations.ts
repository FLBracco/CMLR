import { apiRequest } from "./client";
import type {
  IConsultation,
  IConsultationPayload,
  IConsultationStats,
  IConsultationWithPatient,
} from "../types/consultation";

export const listConsultations = async (
  patientId: string
): Promise<IConsultation[]> => {
  const { consultations } = await apiRequest<{
    consultations: IConsultation[];
  }>(`/patients/${patientId}/consultations`);
  return consultations;
};

export const createConsultation = (
  patientId: string,
  payload: IConsultationPayload
): Promise<IConsultation> =>
  apiRequest<IConsultation>(`/patients/${patientId}/consultations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getConsultationStats = (): Promise<IConsultationStats> =>
  apiRequest<IConsultationStats>("/consultations/stats");

// `from`/`to` son fechas calendario "YYYY-MM-DD" (ambas inclusivas) — nunca
// pasar un ISO completo (`toISOString()`), el backend lo rechaza con 400
// porque `consultation_date` no tiene hora. Ver `dayKey()` en calendarDates.ts.
export const listConsultationsByRange = async (
  from: string,
  to: string
): Promise<IConsultationWithPatient[]> => {
  const { consultations } = await apiRequest<{
    consultations: IConsultationWithPatient[];
  }>(`/consultations?from=${from}&to=${to}`);
  return consultations;
};

export const updateConsultation = (
  id: string,
  payload: Partial<IConsultationPayload>
): Promise<IConsultation> =>
  apiRequest<IConsultation>(`/consultations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
