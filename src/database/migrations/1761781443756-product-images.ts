import type { MigrationInterface, QueryRunner } from "typeorm";

export class ProductImages1761781443756 implements MigrationInterface {
  name = "ProductImages1761781443756";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "imageUri" character varying(500)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "imageUri"
        `);
  }
}
