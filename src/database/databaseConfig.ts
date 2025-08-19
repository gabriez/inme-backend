import type { DataSourceOptions } from "typeorm";

/* entities */
import { Roles } from "@/database/entities/Roles";
import { Users } from "@/database/entities/Users";
import { Historial } from "./entities/Historial";
import { Products } from "./entities/Products";
import { Providers } from "./entities/Providers";
import { ProductionOrders } from "./entities/ProductionOrders";
import { Client } from "./entities/Client";

import { DB } from "@/constants";

const databaseConfig: DataSourceOptions = {
	type: "postgres",
	host: DB.host,
	port: DB.port,
	username: DB.user,
	password: DB.password,
	database: DB.database,
	logging: true,
	ssl: true,
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
	],
};
