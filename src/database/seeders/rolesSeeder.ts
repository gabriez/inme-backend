import type { QueryRunner } from "typeorm";

import { Roles } from "@/database/entities/Roles";

import { DEFAULT_ROLES } from "@/constants";

export async function rolesSeeder(queryRunner: QueryRunner) {
  const RolesRepository = queryRunner.connection.getRepository(Roles);

  const roles: Roles[] = DEFAULT_ROLES.map((rol) =>
    RolesRepository.create({ rol }),
  );
  await RolesRepository.save(roles);
}
