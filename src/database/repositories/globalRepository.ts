import type { DataSource, Repository } from "typeorm";

import { Client } from "../entities/Client";
import { Historial } from "../entities/Historial";
import { MaterialsList } from "../entities/MaterialsList";
import { ProductionOrders } from "../entities/ProductionOrders";
import { Products } from "../entities/Products";
import { Providers } from "../entities/Providers";
import { Roles } from "../entities/Roles";
import { Users } from "../entities/Users";

interface GlobalRepositoryI {
  clientRepository: Repository<Client>;
  userRepository: Repository<Users>;
  providersRepository: Repository<Providers>;
  productsRepository: Repository<Products>;
  materialsListRepository: Repository<MaterialsList>;
  productionOrderRepository: Repository<ProductionOrders>;
  historialRepository: Repository<Historial>;
  rolesRepository: Repository<Roles>;
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
    providersRepository: dataSource.getRepository(Providers),
    productsRepository: dataSource.getRepository(Products),
    materialsListRepository: dataSource.getRepository(MaterialsList),
    productionOrderRepository: dataSource.getRepository(ProductionOrders),
    historialRepository: dataSource.getRepository(Historial),
    rolesRepository: dataSource.getRepository(Roles),
  });
  initialized = true;
  // I don't want the repositories to change
  Object.freeze(GlobalRepository);
}
