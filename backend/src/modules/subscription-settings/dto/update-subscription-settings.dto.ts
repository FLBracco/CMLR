import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateSubscriptionSettingsDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "El monto debe ser un número válido." })
  @Min(0, { message: "El monto no puede ser negativo." })
  monthlyAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  alias?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cbu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountHolderName?: string;

  // Formato wa.me: solo dígitos, con código de país, sin "+" ni espacios
  // (ej. "5493815551234"). Se valida acá para no descubrir un link roto
  // recién cuando el profesional lo clickea.
  @IsOptional()
  @IsString()
  @Matches(/^\d{6,20}$/, {
    message: "El WhatsApp debe tener solo números, con código de país (sin '+' ni espacios).",
  })
  whatsappNumber?: string;
}
