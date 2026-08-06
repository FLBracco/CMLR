import bcrypt from "bcrypt";
import { AppError } from "../../../shared/errors/AppError.js";
import type { LoginDto } from "../dto/login.dto.js";
import type { RegisterProfessionalDto } from "../dto/register.dto.js";
import { ProfessionalRepository } from "../../professionals/repositories/professional.repository.js";
import { ProfessionalSpecialityRepository } from "../../professionals/repositories/professional-speciality.repository.js";
import { signToken } from "./token.service.js";
import type { IAuthResponseDto } from "../dto/auth-response.dto.js";
import type { Professional } from "../../professionals/entities/professional.entity.js";

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository(),
    private readonly specialityRepository = new ProfessionalSpecialityRepository()
  ) {}

  async register(dto: RegisterProfessionalDto): Promise<IAuthResponseDto> {
    const existing = await this.professionalRepository.findByEmail(dto.email);

    if (existing) {
      throw AppError.conflict("Ya existe una cuenta con ese email.");
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
      email: dto.email.toLowerCase(),
      passwordHash,
      speciality,
    });

    return this.buildAuthResponse(professional);
  }

  async login(dto: LoginDto): Promise<IAuthResponseDto> {
    const professional = await this.professionalRepository.findByEmail(
      dto.email
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

    return this.buildAuthResponse(professional);
  }

  private buildAuthResponse(professional: Professional): IAuthResponseDto {
    const token = signToken({
      sub: professional.id,
      email: professional.email,
    });

    return {
      token,
      professional: {
        id: professional.id,
        firstName: professional.firstName,
        lastName: professional.lastName,
        email: professional.email,
        speciality: professional.speciality?.code ?? "",
      },
    };
  }
}
