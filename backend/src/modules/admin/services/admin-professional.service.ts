import { AppError } from "../../../shared/errors/AppError.js";
import { ProfessionalRepository } from "../../professionals/repositories/professional.repository.js";
import type { Professional } from "../../professionals/entities/professional.entity.js";
import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";
import type {
  IAdminProfessionalDto,
  IAdminProfessionalListDto,
} from "../dto/admin-professional.dto.js";

// Transiciones con sentido de negocio: activar (PENDING→ACTIVE), desactivar
// (ACTIVE→DISABLED) y reactivar (DISABLED→ACTIVE). ACTIVE→PENDING queda
// deliberadamente afuera: un profesional activo no "vuelve a pendiente".
const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  PENDING: ["ACTIVE"],
  ACTIVE: ["DISABLED"],
  DISABLED: ["ACTIVE"],
};

export class AdminProfessionalService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository()
  ) {}

  async list(): Promise<IAdminProfessionalListDto> {
    const professionals = await this.professionalRepository.findAll();

    return {
      professionals: professionals.map((professional) =>
        this.toDto(professional)
      ),
    };
  }

  async updateSubscriptionStatus(
    id: string,
    status: SubscriptionStatus
  ): Promise<IAdminProfessionalDto> {
    const professional = await this.professionalRepository.findById(id);

    if (!professional) {
      throw AppError.notFound("Profesional no encontrado.");
    }

    const current = professional.subscriptionStatus;

    if (status !== current && !ALLOWED_TRANSITIONS[current].includes(status)) {
      throw AppError.badRequest(
        `No se puede pasar de ${current} a ${status}.`
      );
    }

    const updated = await this.professionalRepository.updateSubscriptionStatus(
      professional,
      status
    );

    return this.toDto(updated);
  }

  private toDto(professional: Professional): IAdminProfessionalDto {
    return {
      id: professional.id,
      firstName: professional.firstName,
      lastName: professional.lastName,
      email: professional.email,
      speciality: professional.speciality?.code ?? "",
      subscriptionStatus: professional.subscriptionStatus,
      subscriptionUpdatedAt: professional.subscriptionUpdatedAt
        ? professional.subscriptionUpdatedAt.toISOString()
        : null,
      createdAt: professional.createdAt.toISOString(),
    };
  }
}
