import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CoreSchema1649955218198 implements MigrationInterface {
	name = 'CoreSchema1649955218198';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE \`roles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`create_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                \`rol\` varchar(50) NOT NULL,
                UNIQUE INDEX \`IDX_e9355d00b489aef35a3dbb5ea7\` (\`rol\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
		await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`create_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                \`name\` varchar(50) NULL,
                \`username\` varchar(50) NOT NULL,
                \`password\` varchar(150) NOT NULL,
                UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
		await queryRunner.query(`
            CREATE TABLE \`users_rol_roles\` (
                \`usersId\` int NOT NULL,
                \`rolesId\` int NOT NULL,
                INDEX \`IDX_f9ef6a404ddb7bc4a5e1561c11\` (\`usersId\`),
                INDEX \`IDX_69e4154116b3f2643342b7ef2d\` (\`rolesId\`),
                PRIMARY KEY (\`usersId\`, \`rolesId\`)
            ) ENGINE = InnoDB
        `);
		await queryRunner.query(`
            ALTER TABLE \`users_rol_roles\`
            ADD CONSTRAINT \`FK_f9ef6a404ddb7bc4a5e1561c111\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE \`users_rol_roles\`
            ADD CONSTRAINT \`FK_69e4154116b3f2643342b7ef2d8\` FOREIGN KEY (\`rolesId\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`users_rol_roles\` DROP FOREIGN KEY \`FK_69e4154116b3f2643342b7ef2d8\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users_rol_roles\` DROP FOREIGN KEY \`FK_f9ef6a404ddb7bc4a5e1561c111\`
        `);
		await queryRunner.query(`
            DROP INDEX \`IDX_69e4154116b3f2643342b7ef2d\` ON \`users_rol_roles\`
        `);
		await queryRunner.query(`
            DROP INDEX \`IDX_f9ef6a404ddb7bc4a5e1561c11\` ON \`users_rol_roles\`
        `);
		await queryRunner.query(`
            DROP TABLE \`users_rol_roles\`
        `);
		await queryRunner.query(`
            DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\`
        `);
		await queryRunner.query(`
            DROP TABLE \`users\`
        `);
		await queryRunner.query(`
            DROP INDEX \`IDX_e9355d00b489aef35a3dbb5ea7\` ON \`roles\`
        `);
		await queryRunner.query(`
            DROP TABLE \`roles\`
        `);
	}
}
