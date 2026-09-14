import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionSettings1789400611858 implements MigrationInterface {
    name = 'AddSubscriptionSettings1789400611858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_settings" ("id" smallint NOT NULL, "monthly_amount" numeric(10,2), "alias" character varying(100), "cbu" character varying(30), "account_holder_name" character varying(100), "whatsapp_number" character varying(20), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_subscription_settings" PRIMARY KEY ("id"))`);
        // Fila única (singleton, id=1) sin datos todavía: el SuperAdmin los carga
        // desde /admin/configuracion antes de que sirvan de algo a los profesionales.
        await queryRunner.query(`INSERT INTO "subscription_settings" ("id") VALUES (1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subscription_settings"`);
    }

}
