import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateAppointmentDto {
  @IsOptional()
  @IsISO8601({}, { message: "La fecha y hora del turno no son válidas." })
  startsAt?: string;

  @IsOptional()
  @IsInt({ message: "La duración debe ser un número entero de minutos." })
  @Min(5, { message: "La duración mínima es de 5 minutos." })
  @Max(480, { message: "La duración máxima es de 480 minutos." })
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "El motivo no puede superar los 255 caracteres." })
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
