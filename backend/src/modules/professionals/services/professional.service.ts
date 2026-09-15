import { AppError } from "../../../shared/errors/AppError.js";
import { ProfessionalRepository } from "../repositories/professional.repository.js";
import { ProfessionalSpecialityRepository } from "../repositories/professional-speciality.repository.js";
import { SubscriptionExpirationService } from "./subscription-expiration.service.js";
import type { UpdateProfileDto } from "../dto/update-profile.dto.js";
import type { Professional } from "../entities/professional.entity.js";
import type { IProfessionalDto } from "../dto/professional-response.dto.js";

export class ProfessionalService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository(),
    private readonly specialityRepository = new ProfessionalSpecialityRepository(),
    private readonly subscriptionExpiration = new SubscriptionExpirationService(
      professionalRepository
    )
  ) {}

  async getById(id: string): Promise<IProfessionalDto> {
    const professional = await this.getScopedProfessional(id);
    return this.toDto(professional);
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto
  ): Promise<IProfessionalDto> {
    const professional = await this.getScopedProfessional(id);

    const speciality = dto.specialityCode
      ? await this.specialityRepository.findByCode(dto.specialityCode)
      : undefined;

    if (dto.specialityCode && !speciality) {
      throw AppError.badRequest("La especialidad indicada no existe.");
    }

    if (
      dto.licenseNumber !== undefined &&
      dto.licenseNumber !== professional.licenseNumber
    ) {
      const existingLicense = await this.professionalRepository.findByLicenseNumber(
        dto.licenseNumber
      );

      if (existingLicense) {
        throw AppError.conflict("Ya existe una cuenta con esa matrícula.");
      }
    }

    const updated = await this.professionalRepository.update(professional, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(speciality && { speciality }),
      ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
    });

    return this.toDto(updated);
  }

  async reportSubscriptionPayment(id: string): Promise<IProfessionalDto> {
    const professional = await this.getScopedProfessional(id);

    if (professional.subscriptionStatus === "ACTIVE") {
      throw AppError.badRequest("Tu suscripción ya está activa.");
    }

    if (professional.subscriptionStatus === "DISABLED") {
      throw AppError.forbidden(
        "Tu suscripción está desactivada. Contactá al administrador."
      );
    }

    // PAYMENT_REPORTED → no-op: se puede reenviar el comprobante sin que rompa nada.
    if (professional.subscriptionStatus === "PAYMENT_REPORTED") {
      return this.toDto(professional);
    }

    const updated = await this.professionalRepository.updateSubscriptionStatus(
      professional,
      "PAYMENT_REPORTED"
    );

    return this.toDto(updated);
  }

  private async getScopedProfessional(id: string): Promise<Professional> {
    const professional = await this.professionalRepository.findById(id);

    if (!professional) {
      throw AppError.notFound("Profesional no encontrado.");
    }

    // Self-healing: único punto de entrada de getById/updateProfile/
    // reportSubscriptionPayment, así que un solo enforce cubre los tres.
    return this.subscriptionExpiration.enforce(professional);
  }

  private toDto(professional: Professional): IProfessionalDto {
    return {
      id: professional.id,
      firstName: professional.firstName,
      lastName: professional.lastName,
      email: professional.email,
      speciality: professional.speciality?.code ?? "",
      subscriptionStatus: professional.subscriptionStatus,
      licenseNumber: professional.licenseNumber,
    };
  }
}
