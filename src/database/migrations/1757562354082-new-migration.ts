import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1757562354082 implements MigrationInterface {
    name = 'NewMigration1757562354082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "rol" character varying(50) NOT NULL,
                CONSTRAINT "UQ_e9355d00b489aef35a3dbb5ea79" UNIQUE ("rol"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "name" character varying(50),
                "username" character varying(50) NOT NULL,
                "email" character varying(150) NOT NULL,
                "password" character varying(150) NOT NULL,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "codigo" character varying(50) NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "existencia" integer NOT NULL,
                "measureUnit" character varying(50) NOT NULL,
                "planos" character varying(500) NOT NULL,
                "productId" integer,
                CONSTRAINT "UQ_e7a41b4ae1811faffbf9da6a55d" UNIQUE ("codigo"),
                CONSTRAINT "UQ_bca492caee28af042d3cae20fa3" UNIQUE ("nombre"),
                CONSTRAINT "UQ_4557d9234a9eaa7720782c7f6d1" UNIQUE ("planos"),
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "client" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "nombreContacto" character varying(70) NOT NULL,
                "nombreEmpresa" character varying(70) NOT NULL,
                "empresaTelefono" character varying(22) NOT NULL,
                "emailEmpresa" character varying(150) NOT NULL,
                "emailContacto" character varying(150) NOT NULL,
                "ciRif" character varying(30) NOT NULL,
                "direccionFiscal" character varying(350) NOT NULL,
                CONSTRAINT "UQ_07f7ec1aab389b436327bbb92b0" UNIQUE ("ciRif"),
                CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "providers" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "enterpriseName" character varying(100) NOT NULL,
                "personContact" character varying(100) NOT NULL,
                "enterprisePhone" character varying(100) NOT NULL,
                "description" character varying(400) NOT NULL,
                "email" character varying(100) NOT NULL,
                "ciRif" character varying(50) NOT NULL,
                "taxAddress" character varying(200),
                "address" character varying(200),
                "website" character varying(300),
                "instagram" character varying(200),
                CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."production_orders_orderstate_enum" AS ENUM(
                'En proceso',
                'Ejecutada',
                'Cancelada',
                'Por iniciar'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "production_orders" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "cantidadProductoFabricado" integer NOT NULL,
                "orderState" "public"."production_orders_orderstate_enum" NOT NULL DEFAULT 'Por iniciar',
                "startDate" date NOT NULL,
                "endDate" date NOT NULL,
                "realEndDate" date NOT NULL,
                "responsables" character varying(400) NOT NULL,
                "productId" integer,
                CONSTRAINT "REL_8584be8f232016b2c24a4e1258" UNIQUE ("productId"),
                CONSTRAINT "PK_44d72e026027e3448b5d655e16e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."historial_action_enum" AS ENUM('ingreso', 'egreso', 'Order de producción')
        `);
        await queryRunner.query(`
            CREATE TABLE "historial" (
                "id" SERIAL NOT NULL,
                "create_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "description" character varying(300) NOT NULL,
                "action" "public"."historial_action_enum" NOT NULL,
                "cantidad" integer NOT NULL,
                "productId" integer,
                "clientId" integer,
                "providerId" integer,
                "productionOrderId" integer,
                CONSTRAINT "REL_2cada051d69ef275b0ec009d5e" UNIQUE ("productId"),
                CONSTRAINT "REL_05fc7704f457524aab81fc55cb" UNIQUE ("clientId"),
                CONSTRAINT "REL_cb201d8c0d917ca61d71f1880b" UNIQUE ("providerId"),
                CONSTRAINT "REL_dda42c8e0f107f69a3e5ab28a0" UNIQUE ("productionOrderId"),
                CONSTRAINT "PK_4b263e390d61f738528f93bcbe1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users_rol_roles" (
                "usersId" integer NOT NULL,
                "rolesId" integer NOT NULL,
                CONSTRAINT "PK_20577676286285ea905518eb863" PRIMARY KEY ("usersId", "rolesId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f9ef6a404ddb7bc4a5e1561c11" ON "users_rol_roles" ("usersId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_69e4154116b3f2643342b7ef2d" ON "users_rol_roles" ("rolesId")
        `);
        await queryRunner.query(`
            CREATE TABLE "providers_products_products" (
                "providersId" integer NOT NULL,
                "productsId" integer NOT NULL,
                CONSTRAINT "PK_5a92bae6a074840ec82bdaf5bd5" PRIMARY KEY ("providersId", "productsId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ff7b2c2c3f548e0c4559c7f9c7" ON "providers_products_products" ("providersId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_55a4e65b9491741d55872d2811" ON "providers_products_products" ("productsId")
        `);
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_7b3b507508cd0f86a5b2e923459" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
        await queryRunner.query(`
            ALTER TABLE "users_rol_roles"
            ADD CONSTRAINT "FK_f9ef6a404ddb7bc4a5e1561c111" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "users_rol_roles"
            ADD CONSTRAINT "FK_69e4154116b3f2643342b7ef2d8" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "providers_products_products"
            ADD CONSTRAINT "FK_ff7b2c2c3f548e0c4559c7f9c72" FOREIGN KEY ("providersId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "providers_products_products"
            ADD CONSTRAINT "FK_55a4e65b9491741d55872d28112" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "providers_products_products" DROP CONSTRAINT "FK_55a4e65b9491741d55872d28112"
        `);
        await queryRunner.query(`
            ALTER TABLE "providers_products_products" DROP CONSTRAINT "FK_ff7b2c2c3f548e0c4559c7f9c72"
        `);
        await queryRunner.query(`
            ALTER TABLE "users_rol_roles" DROP CONSTRAINT "FK_69e4154116b3f2643342b7ef2d8"
        `);
        await queryRunner.query(`
            ALTER TABLE "users_rol_roles" DROP CONSTRAINT "FK_f9ef6a404ddb7bc4a5e1561c111"
        `);
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
            ALTER TABLE "products" DROP CONSTRAINT "FK_7b3b507508cd0f86a5b2e923459"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_55a4e65b9491741d55872d2811"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ff7b2c2c3f548e0c4559c7f9c7"
        `);
        await queryRunner.query(`
            DROP TABLE "providers_products_products"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_69e4154116b3f2643342b7ef2d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f9ef6a404ddb7bc4a5e1561c11"
        `);
        await queryRunner.query(`
            DROP TABLE "users_rol_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "historial"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."historial_action_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "production_orders"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."production_orders_orderstate_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "providers"
        `);
        await queryRunner.query(`
            DROP TABLE "client"
        `);
        await queryRunner.query(`
            DROP TABLE "products"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
    }

}
