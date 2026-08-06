import { IsEmail, IsIn, IsString, Matches, MinLength } from "class-validator";

export class RegisterProfessionalDto {
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: "El apellido debe tener al menos 2 caracteres." })
  lastName!: string;

  @IsEmail({}, { message: "El email no es válido." })
  email!: string;

  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres." })
  @Matches(/[A-Z]/, {
    message: "La contraseña debe contener al menos una letra mayúscula.",
  })
  @Matches(/[0-9]/, {
    message: "La contraseña debe contener al menos un número.",
  })
  password!: string;

  @IsIn(["psychologist", "psychiatrist"], {
    message: "La especialidad debe ser psychologist o psychiatrist.",
  })
  specialityCode!: string;
}
