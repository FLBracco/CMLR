import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateConsultationDto {
  @IsDateString({}, { message: "La fecha de la consulta no es válida." })
  consultationDate!: string;

  @IsString()
  @MinLength(1, { message: "Las observaciones no pueden estar vacías." })
  observations!: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsString()
  @MinLength(1, { message: "El plan de seguimiento no puede estar vacío." })
  followUpPlan!: string;
}
