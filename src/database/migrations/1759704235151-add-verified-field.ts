import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerifiedField1759704235151 implements MigrationInterface {
  name = "AddVerifiedField1759704235151";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "verified" boolean NOT NULL DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "verified"
        `);
  }
}
