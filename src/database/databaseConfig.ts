import type { DataSourceOptions } from "typeorm";

import { DB } from "../constants";
import { Client } from "./entities/Client";
import { Historial } from "./entities/Historial";
import { MaterialsList } from "./entities/MaterialsList";
import { ProductionOrders } from "./entities/ProductionOrders";
import { Products } from "./entities/Products";
import { Providers } from "./entities/Providers";
/* entities */
import { Roles } from "./entities/Roles";
import { Users } from "./entities/Users";

const databaseConfig: DataSourceOptions = {
  type: "postgres",
  host: DB.host,
  port: DB.port,
  username: DB.user,
  password: DB.password,
  database: DB.database,
  logging: true,
  ssl: DB.ssl,
};

export const dataSourceOptionsCommon: DataSourceOptions = {
  ...databaseConfig,
  entities: [
    Roles,
    Users,
    Historial,
    Products,
    Providers,
    ProductionOrders,
    Client,
    MaterialsList,
  ],
};
