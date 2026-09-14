import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El apellido debe tener al menos 2 caracteres." })
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsIn(["psychologist", "psychiatrist"], {
    message: "La especialidad debe ser psychologist o psychiatrist.",
  })
  specialityCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: "La matrícula debe tener al menos 3 caracteres." })
  @MaxLength(50)
  licenseNumber?: string;
}
