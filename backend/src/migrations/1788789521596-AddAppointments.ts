import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointments1788789521596 implements MigrationInterface {
    name = 'AddAppointments1788789521596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Requerida por el EXCLUDE de más abajo (índice GiST sobre columna uuid + rango).
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "professional_id" uuid NOT NULL, "patient_id" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "reason" character varying(255), "notes" text, "cancellation_reason" text, "status_updated_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "cancelled_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3330f054416745deaa2cc13070" ON "appointments"  ("patient_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1ec2104a7bc737df7d692488ef" ON "appointments"  ("professional_id", "starts_at") `);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "CHK_appointments_ends_after_starts" CHECK ("ends_at" > "starts_at")`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "CHK_appointments_status" CHECK ("status" IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_60b7a60cf6727d87d525a750414" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_d7ca5e722b384f282042d92f4c1" FOREIGN KEY ("created_by") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_671b4499922315bccf6c4fa8c65" FOREIGN KEY ("cancelled_by") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Anti-solapamiento a nivel de DB: dos turnos PENDING/CONFIRMED del mismo profesional no pueden compartir horario.
        // Los turnos CANCELLED/COMPLETED/NO_SHOW quedan fuera del constraint (liberan el horario).
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "EXCL_appointments_no_overlap" EXCLUDE USING gist ("professional_id" WITH =, tstzrange("starts_at", "ends_at", '[)') WITH &&) WHERE ("status" IN ('PENDING', 'CONFIRMED'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "EXCL_appointments_no_overlap"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_671b4499922315bccf6c4fa8c65"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_d7ca5e722b384f282042d92f4c1"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_60b7a60cf6727d87d525a750414"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "CHK_appointments_status"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "CHK_appointments_ends_after_starts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ec2104a7bc737df7d692488ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3330f054416745deaa2cc13070"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        // La extensión btree_gist se deja instalada (no se sabe si otro objeto de la DB la usa).
    }

}
