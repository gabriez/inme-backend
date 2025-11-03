import type { DataSourceOptions } from "typeorm";

import { Client } from "./entities/Client.js";
import { Historial } from "./entities/Historial.js";
import { MaterialsList } from "./entities/MaterialsList.js";
import { ProductionOrders } from "./entities/ProductionOrders.js";
import { Products } from "./entities/Products.js";
import { Providers } from "./entities/Providers.js";
/* entities */
import { Roles } from "./entities/Roles.js";
import { Users } from "./entities/Users.js";

import { DB } from "@/constants";

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
