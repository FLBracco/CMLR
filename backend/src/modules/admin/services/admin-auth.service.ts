import bcrypt from "bcrypt";
import { AppError } from "../../../shared/errors/AppError.js";
import type { LoginDto } from "../../auth/dto/login.dto.js";
import { AdminRepository } from "../repositories/admin.repository.js";
import { signToken } from "../../auth/services/token.service.js";
import type { IAdminAuthResponseDto } from "../dto/admin-auth-response.dto.js";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class AdminAuthService {
  constructor(private readonly adminRepository = new AdminRepository()) {}

  async login(dto: LoginDto): Promise<IAdminAuthResponseDto> {
    const admin = await this.adminRepository.findByEmail(
      normalizeEmail(dto.email)
    );

    if (!admin) {
      throw AppError.unauthorized("Credenciales inválidas.");
    }

    const isValid = await bcrypt.compare(dto.password, admin.passwordHash);

    if (!isValid) {
      throw AppError.unauthorized("Credenciales inválidas.");
    }

    const token = signToken({
      sub: admin.id,
      email: admin.email,
      role: "superadmin",
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    };
  }
}
