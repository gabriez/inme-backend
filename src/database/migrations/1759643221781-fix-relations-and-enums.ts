import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixRelationsAndEnums1759643221781 implements MigrationInterface {
  name = "FixRelationsAndEnums1759643221781";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "existenciaReservada" double precision NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders" DROP CONSTRAINT "FK_8584be8f232016b2c24a4e12589"
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders" DROP CONSTRAINT "REL_8584be8f232016b2c24a4e1258"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_2cada051d69ef275b0ec009d5e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_05fc7704f457524aab81fc55cbc"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_cb201d8c0d917ca61d71f1880b3"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_dda42c8e0f107f69a3e5ab28a07"
        `);
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
                'Gasto por orden de producción'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ALTER COLUMN "action" TYPE "public"."historial_action_enum" USING "action"::"text"::"public"."historial_action_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."historial_action_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "REL_2cada051d69ef275b0ec009d5e"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "REL_05fc7704f457524aab81fc55cb"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "REL_cb201d8c0d917ca61d71f1880b"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "REL_dda42c8e0f107f69a3e5ab28a0"
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ADD CONSTRAINT "FK_8584be8f232016b2c24a4e12589" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_2cada051d69ef275b0ec009d5e5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_05fc7704f457524aab81fc55cbc" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_cb201d8c0d917ca61d71f1880b3" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_dda42c8e0f107f69a3e5ab28a07" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_dda42c8e0f107f69a3e5ab28a07"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_cb201d8c0d917ca61d71f1880b3"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_05fc7704f457524aab81fc55cbc"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial" DROP CONSTRAINT "FK_2cada051d69ef275b0ec009d5e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders" DROP CONSTRAINT "FK_8584be8f232016b2c24a4e12589"
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "REL_dda42c8e0f107f69a3e5ab28a0" UNIQUE ("productionOrderId")
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "REL_cb201d8c0d917ca61d71f1880b" UNIQUE ("providerId")
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "REL_05fc7704f457524aab81fc55cb" UNIQUE ("clientId")
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "REL_2cada051d69ef275b0ec009d5e" UNIQUE ("productId")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."historial_action_enum_old" AS ENUM('ingreso', 'egreso', 'Order de producción')
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
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_dda42c8e0f107f69a3e5ab28a07" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_cb201d8c0d917ca61d71f1880b3" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_05fc7704f457524aab81fc55cbc" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "historial"
            ADD CONSTRAINT "FK_2cada051d69ef275b0ec009d5e5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ADD CONSTRAINT "REL_8584be8f232016b2c24a4e1258" UNIQUE ("productId")
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ADD CONSTRAINT "FK_8584be8f232016b2c24a4e12589" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "existenciaReservada"
        `);
  }
}
