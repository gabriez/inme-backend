import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixEnumHistorial1759643952609 implements MigrationInterface {
  name = "FixEnumHistorial1759643952609";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TYPE "public"."historial_action_enum"
            RENAME TO "historial_action_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."historial_action_enum" AS ENUM(
                'ingreso',
                'egreso',
                'venta',
                'Orden de producción',
                'varios',
                'Gasto por orden de producción',
                'Ingreso por producción'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ALTER COLUMN "action" TYPE "public"."historial_action_enum" USING "action"::"text"::"public"."historial_action_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."historial_action_enum_old"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."historial_action_enum_old" AS ENUM(
                'ingreso',
                'egreso',
                'venta',
                'Orden de producción',
                'varios',
                'Gasto por orden de producción'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ALTER COLUMN "action" TYPE "public"."historial_action_enum_old" USING "action"::"text"::"public"."historial_action_enum_old"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."historial_action_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."historial_action_enum_old"
            RENAME TO "historial_action_enum"
        `);
  }
}
