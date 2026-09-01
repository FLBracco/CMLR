import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionsAndAdmins1788274429176 implements MigrationInterface {
    name = 'AddSubscriptionsAndAdmins1788274429176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD "subscription_status" character varying(20) NOT NULL DEFAULT 'PENDING'`);
        // Backfill: los profesionales existentes ya tenían acceso pleno antes de que existiera este concepto.
        await queryRunner.query(`UPDATE "professionals" SET "subscription_status" = 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "CHK_professionals_subscription_status" CHECK ("subscription_status" IN ('PENDING', 'ACTIVE', 'DISABLED'))`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD "subscription_updated_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "professionals" DROP COLUMN "subscription_updated_at"`);
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "CHK_professionals_subscription_status"`);
        await queryRunner.query(`ALTER TABLE "professionals" DROP COLUMN "subscription_status"`);
        await queryRunner.query(`DROP TABLE "admins"`);
    }

}
