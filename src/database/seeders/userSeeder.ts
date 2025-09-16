import type { QueryRunner } from "typeorm";

/* entities */
import { Roles } from "../entities/Roles";
import { Users } from "../entities/Users";

export async function userSeeder(queryRunner: QueryRunner) {
  const UserRepository = queryRunner.connection.getRepository(Users);
  const RolesRepository = queryRunner.connection.getRepository(Roles);

  const rolSuperadmin = await RolesRepository.findOneBy({ rol: "SUPERADMIN" });

  if (!rolSuperadmin) return;

  const users = UserRepository.create([
    {
      name: "superadmin",
      username: "superadmin",
      password: "123456",
      rol: [rolSuperadmin],
    },
  ]);

  await UserRepository.save(users);
}
