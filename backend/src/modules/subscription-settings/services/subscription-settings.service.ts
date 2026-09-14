import { AppError } from "../../../shared/errors/AppError.js";
import { SubscriptionSettingsRepository } from "../repositories/subscription-settings.repository.js";
import type { UpdateSubscriptionSettingsDto } from "../dto/update-subscription-settings.dto.js";
import type { SubscriptionSettings } from "../entities/subscription-settings.entity.js";
import type { ISubscriptionSettingsDto } from "../dto/subscription-settings-response.dto.js";

export class SubscriptionSettingsService {
  constructor(
    private readonly subscriptionSettingsRepository = new SubscriptionSettingsRepository()
  ) {}

  async get(): Promise<ISubscriptionSettingsDto> {
    const settings = await this.getRow();
    return this.toDto(settings);
  }

  async update(
    dto: UpdateSubscriptionSettingsDto
  ): Promise<ISubscriptionSettingsDto> {
    const settings = await this.getRow();

    const updated = await this.subscriptionSettingsRepository.update(settings, {
      ...(dto.monthlyAmount !== undefined && {
        monthlyAmount: String(dto.monthlyAmount),
      }),
      // Un campo de texto vacío significa "borrar" el valor, no guardar "".
      ...(dto.alias !== undefined && { alias: dto.alias.trim() || null }),
      ...(dto.cbu !== undefined && { cbu: dto.cbu.trim() || null }),
      ...(dto.accountHolderName !== undefined && {
        accountHolderName: dto.accountHolderName.trim() || null,
      }),
      ...(dto.whatsappNumber !== undefined && {
        whatsappNumber: dto.whatsappNumber.trim() || null,
      }),
    });

    return this.toDto(updated);
  }

  // La migración siembra la fila id=1 — si no está, la infraestructura está
  // mal migrada, no es un caso de negocio esperable (por eso 500, no 404).
  private async getRow(): Promise<SubscriptionSettings> {
    const settings = await this.subscriptionSettingsRepository.get();

    if (!settings) {
      throw AppError.badRequest("La configuración de suscripción no está inicializada.");
    }

    return settings;
  }

  private toDto(settings: SubscriptionSettings): ISubscriptionSettingsDto {
    return {
      monthlyAmount:
        settings.monthlyAmount !== null ? Number(settings.monthlyAmount) : null,
      alias: settings.alias,
      cbu: settings.cbu,
      accountHolderName: settings.accountHolderName,
      whatsappNumber: settings.whatsappNumber,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}
