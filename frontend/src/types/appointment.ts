export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface IAppointmentPatientSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface IAppointment {
  id: string;
  professionalId: string;
  patientId: string;
  patient: IAppointmentPatientSummary;
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

export interface IAppointmentStats {
  appointmentsToday: number;
  appointmentsThisWeek: number;
  pendingConfirmation: number;
}

export interface IAppointmentPayload {
  patientId: string;
  startsAt: string;
  durationMinutes: number;
  reason?: string;
  notes?: string;
}

export interface IUpdateAppointmentPayload {
  startsAt?: string;
  durationMinutes?: number;
  reason?: string;
  notes?: string;
}

export interface IUpdateAppointmentStatusPayload {
  status: AppointmentStatus;
  cancellationReason?: string;
}
