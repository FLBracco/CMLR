import type { AppointmentStatus } from "../entities/appointment-status.js";

export interface IAppointmentPatientSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface IAppointmentDto {
  id: string;
  professionalId: string;
  patientId: string;
  patient: IAppointmentPatientSummaryDto;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  cancellationReason: string | null;
  statusUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAppointmentListDto {
  appointments: IAppointmentDto[];
}
