import { apiRequest } from "./client";
import type { IPatient, IPatientPayload } from "../types/patient";

export const listPatients = async (search?: string): Promise<IPatient[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const { patients } = await apiRequest<{ patients: IPatient[] }>(
    `/patients${query}`
  );
  return patients;
};

export const getPatient = (id: string): Promise<IPatient> =>
  apiRequest<IPatient>(`/patients/${id}`);

export const createPatient = (payload: IPatientPayload): Promise<IPatient> =>
  apiRequest<IPatient>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updatePatient = (
  id: string,
  payload: Partial<IPatientPayload>
): Promise<IPatient> =>
  apiRequest<IPatient>(`/patients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
