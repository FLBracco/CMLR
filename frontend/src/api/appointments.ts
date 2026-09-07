import { apiRequest } from "./client";
import type {
  IAppointment,
  IAppointmentPayload,
  IAppointmentStats,
  IUpdateAppointmentPayload,
  IUpdateAppointmentStatusPayload,
} from "../types/appointment";

export const listAppointments = async (
  from: string,
  to: string
): Promise<IAppointment[]> => {
  const query = new URLSearchParams({ from, to }).toString();
  const { appointments } = await apiRequest<{ appointments: IAppointment[] }>(
    `/appointments?${query}`
  );
  return appointments;
};

export const listPatientAppointments = async (
  patientId: string,
  upcomingOnly = false
): Promise<IAppointment[]> => {
  const query = upcomingOnly ? "?upcoming=true" : "";
  const { appointments } = await apiRequest<{ appointments: IAppointment[] }>(
    `/patients/${patientId}/appointments${query}`
  );
  return appointments;
};

export const getAppointmentStats = (): Promise<IAppointmentStats> =>
  apiRequest<IAppointmentStats>("/appointments/stats");

export const getAppointment = (id: string): Promise<IAppointment> =>
  apiRequest<IAppointment>(`/appointments/${id}`);

export const createAppointment = (
  payload: IAppointmentPayload
): Promise<IAppointment> =>
  apiRequest<IAppointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAppointment = (
  id: string,
  payload: IUpdateAppointmentPayload
): Promise<IAppointment> =>
  apiRequest<IAppointment>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateAppointmentStatus = (
  id: string,
  payload: IUpdateAppointmentStatusPayload
): Promise<IAppointment> =>
  apiRequest<IAppointment>(`/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
