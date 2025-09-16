import type { DataSource, Repository } from "typeorm";

import { Client } from "../entities/Client";
import { Users } from "../entities/Users";

interface GlobalRepositoryI {
  clientRepository: Repository<Client>;
  userRepository: Repository<Users>;
}

export const GlobalRepository: GlobalRepositoryI = {} as GlobalRepositoryI;
let initialized = false;

/**
 * Inicializa los repositorios UNA VEZ con el DataSource dado.
 */
export function buildRepositories(dataSource: DataSource): void {
  if (initialized) return;
  Object.assign(GlobalRepository, {
    clientRepository: dataSource.getRepository(Client),
    userRepository: dataSource.getRepository(Users),
  });
  initialized = true;
  // I don't want the repositories to change
  Object.freeze(GlobalRepository);
}
