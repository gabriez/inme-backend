import type { MigrationInterface, QueryRunner } from 'typeorm';

import { rolesSeeder } from './rolesSeeder';
/* seeders */
import { userSeeder } from './userSeeder';

export class CoreSeeder1649938942846 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await rolesSeeder(queryRunner);
		await userSeeder(queryRunner);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	public async down(queryRunner: QueryRunner): Promise<void> {}
}
