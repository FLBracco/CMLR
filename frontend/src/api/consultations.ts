import { apiRequest } from "./client";
import type { IConsultation, IConsultationPayload } from "../types/consultation";

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

export const updateConsultation = (
  id: string,
  payload: Partial<IConsultationPayload>
): Promise<IConsultation> =>
  apiRequest<IConsultation>(`/consultations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
