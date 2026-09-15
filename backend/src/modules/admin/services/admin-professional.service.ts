import { AppError } from "../../../shared/errors/AppError.js";
import { ProfessionalRepository } from "../../professionals/repositories/professional.repository.js";
import type { Professional } from "../../professionals/entities/professional.entity.js";
import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";
import type {
  IAdminProfessionalDto,
  IAdminProfessionalListDto,
} from "../dto/admin-professional.dto.js";

// Transiciones con sentido de negocio: activar (PENDING/PAYMENT_REPORTED→ACTIVE),
// desactivar (ACTIVE→DISABLED) y reactivar (DISABLED→ACTIVE). PENDING→ACTIVE se
// mantiene porque el comprobante puede llegar por WhatsApp sin que el profesional
// haya pasado por PAYMENT_REPORTED. PAYMENT_REPORTED→PENDING es el rechazo (el
// comprobante no era válido o nunca llegó, vuelve a la cola de nuevos).
// PAYMENT_REPORTED→DISABLED queda afuera: DISABLED es "tenía acceso y lo perdió",
// y quien recién avisó el pago nunca tuvo acceso. ACTIVE→PENDING/PAYMENT_REPORTED
// queda deliberadamente afuera: un profesional activo no "vuelve atrás".
const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  PENDING: ["PAYMENT_REPORTED", "ACTIVE"],
  PAYMENT_REPORTED: ["ACTIVE", "PENDING"],
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
      licenseNumber: professional.licenseNumber,
      speciality: professional.speciality?.code ?? "",
      subscriptionStatus: professional.subscriptionStatus,
      subscriptionUpdatedAt: professional.subscriptionUpdatedAt
        ? professional.subscriptionUpdatedAt.toISOString()
        : null,
      createdAt: professional.createdAt.toISOString(),
    };
  }
}
