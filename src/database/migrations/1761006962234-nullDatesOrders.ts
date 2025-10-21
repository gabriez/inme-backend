import type { MigrationInterface, QueryRunner } from "typeorm";

export class NullDatesOrders1761006962234 implements MigrationInterface {
  name = "NullDatesOrders1761006962234";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "materials_list" DROP CONSTRAINT "FK_66c7324182cb57a166723f611bb"
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list" DROP CONSTRAINT "FK_f1eac4d98586b9003345ae9855b"
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ALTER COLUMN "idProdCompuestoId"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ALTER COLUMN "idProdComponenteId"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ALTER COLUMN "startDate" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ALTER COLUMN "realEndDate" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ADD CONSTRAINT "FK_66c7324182cb57a166723f611bb" FOREIGN KEY ("idProdCompuestoId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ADD CONSTRAINT "FK_f1eac4d98586b9003345ae9855b" FOREIGN KEY ("idProdComponenteId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "materials_list" DROP CONSTRAINT "FK_f1eac4d98586b9003345ae9855b"
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list" DROP CONSTRAINT "FK_66c7324182cb57a166723f611bb"
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ALTER COLUMN "realEndDate"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "production_orders"
            ALTER COLUMN "startDate"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ALTER COLUMN "idProdComponenteId" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ALTER COLUMN "idProdCompuestoId" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ADD CONSTRAINT "FK_f1eac4d98586b9003345ae9855b" FOREIGN KEY ("idProdComponenteId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "materials_list"
            ADD CONSTRAINT "FK_66c7324182cb57a166723f611bb" FOREIGN KEY ("idProdCompuestoId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
