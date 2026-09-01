import { AppDataSource } from "../../../config/db/data-source.js";
import { Admin } from "../entities/admin.entity.js";

export class AdminRepository {
  private readonly repository = AppDataSource.getRepository(Admin);

  async findByEmail(email: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repository.findOne({ where: { id } });
  }
}
