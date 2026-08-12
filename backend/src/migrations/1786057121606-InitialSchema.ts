import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786057121606 implements MigrationInterface {
    name = 'InitialSchema1786057121606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "professional_specialities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(55) NOT NULL, "name" character varying(55) NOT NULL, CONSTRAINT "UQ_2df6cd7f8e64cdb1f3a2d846db5" UNIQUE ("code"), CONSTRAINT "UQ_564409552f3689ff2682e541ed7" UNIQUE ("name"), CONSTRAINT "PK_2941932f6bf2d8e97fbbca2ed4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "professionals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "specialty_id" uuid NOT NULL, CONSTRAINT "UQ_abe951107d83dd7866cfc4907b0" UNIQUE ("email"), CONSTRAINT "PK_d7dc8473b49fcd938def2799387" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "professional_id" uuid NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "dni" character varying(20) NOT NULL, "birth_date" date NOT NULL, "phone" character varying(30) NOT NULL, "email" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1acb920f77207db92f0f4fc051" ON "patients"  ("professional_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4f5177d5640c0fd8ba0227e8e0" ON "patients"  ("first_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd946deaeffcf439a423152c14" ON "patients"  ("last_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_b09e471222674eb27a9ed8881b" ON "patients"  ("dni") `);
        await queryRunner.query(`CREATE TABLE "consultations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "consultation_date" date NOT NULL, "observations" text NOT NULL, "diagnosis" text, "follow_up_plan" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c5b78e9424d9bc68464f6a12103" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ee6c335246d3b937f11c329c83" ON "consultations"  ("patient_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6c8e15e41d25aff036caa4ac" ON "consultations"  ("consultation_date") `);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "FK_bf66c09f8b5616c00096f1833a3" FOREIGN KEY ("specialty_id") REFERENCES "professional_specialities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_1acb920f77207db92f0f4fc051a" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultations" ADD CONSTRAINT "FK_ee6c335246d3b937f11c329c837" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consultations" DROP CONSTRAINT "FK_ee6c335246d3b937f11c329c837"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_1acb920f77207db92f0f4fc051a"`);
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "FK_bf66c09f8b5616c00096f1833a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eb6c8e15e41d25aff036caa4ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ee6c335246d3b937f11c329c83"`);
        await queryRunner.query(`DROP TABLE "consultations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b09e471222674eb27a9ed8881b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd946deaeffcf439a423152c14"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4f5177d5640c0fd8ba0227e8e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1acb920f77207db92f0f4fc051"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TABLE "professionals"`);
        await queryRunner.query(`DROP TABLE "professional_specialities"`);
    }

}
