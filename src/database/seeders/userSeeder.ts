import type { QueryRunner } from "typeorm";

/* entities */
import { Roles } from "../entities/Roles";
import { Users } from "../entities/Users";

export async function userSeeder(queryRunner: QueryRunner) {
  const UserRepository = queryRunner.connection.getRepository(Users);
  const RolesRepository = queryRunner.connection.getRepository(Roles);

  const rolSuperadmin = await RolesRepository.findOneBy({ rol: "SUPERADMIN" });

  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const email = process.env.EMAIL;

  if (!rolSuperadmin || !username || !password || !email) return;

  const users = UserRepository.create([
    {
      email,
      name: "superadmin",
      username,
      password,
      rol: [rolSuperadmin],
      verified: true,
    },
  ]);

  await UserRepository.save(users);
}
