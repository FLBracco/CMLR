import { AppError } from "../../../shared/errors/AppError.js";
import { ProfessionalRepository } from "../repositories/professional.repository.js";
import { ProfessionalSpecialityRepository } from "../repositories/professional-speciality.repository.js";
import type { UpdateProfileDto } from "../dto/update-profile.dto.js";
import type { Professional } from "../entities/professional.entity.js";
import type { IProfessionalDto } from "../dto/professional-response.dto.js";

export class ProfessionalService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository(),
    private readonly specialityRepository = new ProfessionalSpecialityRepository()
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

    const updated = await this.professionalRepository.update(professional, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(speciality && { speciality }),
    });

    return this.toDto(updated);
  }

  private async getScopedProfessional(id: string): Promise<Professional> {
    const professional = await this.professionalRepository.findById(id);

    if (!professional) {
      throw AppError.notFound("Profesional no encontrado.");
    }

    return professional;
  }

  private toDto(professional: Professional): IProfessionalDto {
    return {
      id: professional.id,
      firstName: professional.firstName,
      lastName: professional.lastName,
      email: professional.email,
      speciality: professional.speciality?.code ?? "",
    };
  }
}
