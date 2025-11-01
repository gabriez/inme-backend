import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixMigrationImage1761782358505 implements MigrationInterface {
  name = "FixMigrationImage1761782358505";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "imageUri"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "imageUri" json
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "imageUri"
        `);
    await queryRunner.query(`
            ALTER TABLE "products"
            ADD "imageUri" character varying(500)
        `);
  }
}
