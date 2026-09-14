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

export interface IConsultationPatientSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface IConsultationWithPatientDto extends IConsultationDto {
  patient: IConsultationPatientSummaryDto;
}

export interface IConsultationRangeListDto {
  consultations: IConsultationWithPatientDto[];
}

export interface IConsultationStatsDto {
  consultationsThisWeek: number;
  consultationsThisMonth: number;
}
