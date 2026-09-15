import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentReportedSubscriptionStatus1789474924384 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "CHK_professionals_subscription_status"`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "CHK_professionals_subscription_status" CHECK ("subscription_status" IN ('PENDING', 'PAYMENT_REPORTED', 'ACTIVE', 'DISABLED'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "CHK_professionals_subscription_status"`);
        // Nadie puede quedar en PAYMENT_REPORTED antes de volver al constraint original de 3 valores.
        await queryRunner.query(`UPDATE "professionals" SET "subscription_status" = 'PENDING' WHERE "subscription_status" = 'PAYMENT_REPORTED'`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "CHK_professionals_subscription_status" CHECK ("subscription_status" IN ('PENDING', 'ACTIVE', 'DISABLED'))`);
    }

}
