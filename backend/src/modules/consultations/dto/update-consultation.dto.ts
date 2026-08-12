import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateConsultationDto {
  @IsOptional()
  @IsDateString({}, { message: "La fecha de la consulta no es válida." })
  consultationDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Las observaciones no pueden estar vacías." })
  observations?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: "El plan de seguimiento no puede estar vacío." })
  followUpPlan?: string;
}
