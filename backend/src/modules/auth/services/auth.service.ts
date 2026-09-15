import bcrypt from "bcrypt";
import { AppError } from "../../../shared/errors/AppError.js";
import type { LoginDto } from "../dto/login.dto.js";
import type { RegisterProfessionalDto } from "../dto/register.dto.js";
import { ProfessionalRepository } from "../../professionals/repositories/professional.repository.js";
import { ProfessionalSpecialityRepository } from "../../professionals/repositories/professional-speciality.repository.js";
import { SubscriptionExpirationService } from "../../professionals/services/subscription-expiration.service.js";
import { signToken } from "./token.service.js";
import type { IAuthResponseDto } from "../dto/auth-response.dto.js";
import type { Professional } from "../../professionals/entities/professional.entity.js";

const SALT_ROUNDS = 10;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class AuthService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository(),
    private readonly specialityRepository = new ProfessionalSpecialityRepository(),
    private readonly subscriptionExpiration = new SubscriptionExpirationService(
      professionalRepository
    )
  ) {}

  async register(dto: RegisterProfessionalDto): Promise<IAuthResponseDto> {
    const existing = await this.professionalRepository.findByEmail(
      normalizeEmail(dto.email)
    );

    if (existing) {
      throw AppError.conflict("Ya existe una cuenta con ese email.");
    }

    const existingLicense = await this.professionalRepository.findByLicenseNumber(
      dto.licenseNumber
    );

    if (existingLicense) {
      throw AppError.conflict("Ya existe una cuenta con esa matrícula.");
    }

    const speciality = await this.specialityRepository.findByCode(
      dto.specialityCode
    );

    if (!speciality) {
      throw AppError.badRequest("La especialidad indicada no existe.");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const professional = await this.professionalRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: normalizeEmail(dto.email),
      passwordHash,
      speciality,
      licenseNumber: dto.licenseNumber,
    });

    return this.buildAuthResponse(professional);
  }

  async login(dto: LoginDto): Promise<IAuthResponseDto> {
    const professional = await this.professionalRepository.findByEmail(
      normalizeEmail(dto.email)
    );

    if (!professional) {
      throw AppError.unauthorized("Credenciales inválidas.");
    }

    const isValid = await bcrypt.compare(
      dto.password,
      professional.passwordHash
    );

    if (!isValid) {
      throw AppError.unauthorized("Credenciales inválidas.");
    }

    // Self-healing: el login no pasa por ProfessionalService, así que sin
    // esto un profesional vencido entraría con la UI habilitada y recién
    // chocaría contra un 403 al pedir datos (requireActiveSubscription).
    const current = await this.subscriptionExpiration.enforce(professional);

    return this.buildAuthResponse(current);
  }

  private buildAuthResponse(professional: Professional): IAuthResponseDto {
    const token = signToken({
      sub: professional.id,
      email: professional.email,
      role: "professional",
    });

    return {
      token,
      professional: {
        id: professional.id,
        firstName: professional.firstName,
        lastName: professional.lastName,
        email: professional.email,
        speciality: professional.speciality?.code ?? "",
        subscriptionStatus: professional.subscriptionStatus,
        licenseNumber: professional.licenseNumber,
      },
    };
  }
}
