import type { MigrationInterface, QueryRunner } from "typeorm";

// Corre antes que InitialSchema (timestamp menor) porque las entities usan
// uuid_generate_v4() como default de columna. En Docker local la extension
// ya estaba creada a mano; en una DB nueva (ej. Neon) no viene instalada.
export class EnableExtensions1786057121000 implements MigrationInterface {
    name = 'EnableExtensions1786057121000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(): Promise<void> {
        // No se dropea: otras tablas dependen de uuid_generate_v4() como default.
    }
}
