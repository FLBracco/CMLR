import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreatePatientDto {
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(2, { message: "El apellido debe tener al menos 2 caracteres." })
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9.]+$/, { message: "El DNI solo puede contener números y puntos." })
  dni!: string;

  @IsDateString({}, { message: "La fecha de nacimiento no es válida." })
  birthDate!: string;

  @IsString()
  @MaxLength(30)
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: "El email no es válido." })
  @MaxLength(255)
  email?: string;
}
