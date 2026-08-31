export interface IConsultation {
  id: string;
  patientId: string;
  consultationDate: string;
  observations: string;
  diagnosis: string | null;
  followUpPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConsultationStats {
  consultationsThisWeek: number;
  consultationsThisMonth: number;
}

export interface IConsultationPayload {
  consultationDate: string;
  observations: string;
  diagnosis?: string;
  followUpPlan: string;
}
