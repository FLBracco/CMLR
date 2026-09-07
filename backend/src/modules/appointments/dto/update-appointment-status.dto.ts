import { IsIn, IsString, MaxLength, ValidateIf } from "class-validator";
import { APPOINTMENT_STATUSES } from "../entities/appointment-status.js";
import type { AppointmentStatus } from "../entities/appointment-status.js";

export class UpdateAppointmentStatusDto {
  @IsIn(APPOINTMENT_STATUSES, {
    message: `El estado debe ser uno de: ${APPOINTMENT_STATUSES.join(", ")}.`,
  })
  status!: AppointmentStatus;

  // Obligatorio solo al cancelar: es el único estado terminal donde el motivo
  // aporta valor (completado/ausente no necesitan explicación).
  @ValidateIf((dto: UpdateAppointmentStatusDto) => dto.status === "CANCELLED")
  @IsString({ message: "El motivo de cancelación es obligatorio." })
  @MaxLength(500, {
    message: "El motivo de cancelación no puede superar los 500 caracteres.",
  })
  cancellationReason?: string;
}
