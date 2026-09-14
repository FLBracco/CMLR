import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfessionalLicenseNumber1789398381249 implements MigrationInterface {
    name = 'AddProfessionalLicenseNumber1789398381249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "professionals" ADD "license_number" character varying(50)`);
        // Backfill: los profesionales existentes se registraron antes de que la matrícula
        // fuera obligatoria. Placeholder único por fila (sufijo del id) para no romper la
        // constraint UNIQUE que se agrega después — se corrige a mano desde /perfil.
        await queryRunner.query(`UPDATE "professionals" SET "license_number" = 'PENDIENTE-' || "id" WHERE "license_number" IS NULL`);
        await queryRunner.query(`ALTER TABLE "professionals" ALTER COLUMN "license_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "UQ_professionals_license_number" UNIQUE ("license_number")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "UQ_professionals_license_number"`);
        await queryRunner.query(`ALTER TABLE "professionals" DROP COLUMN "license_number"`);
    }

}
