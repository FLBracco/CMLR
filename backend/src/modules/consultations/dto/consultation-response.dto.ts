export interface IConsultationDto {
  id: string;
  patientId: string;
  consultationDate: string;
  observations: string;
  diagnosis: string | null;
  followUpPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConsultationListDto {
  consultations: IConsultationDto[];
}
