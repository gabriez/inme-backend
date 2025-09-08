import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { CoreSchema1757275174123 } from "./migrations/1757275174123-coreSchema";

const AppDataSource = new DataSource({
	...dataSourceOptionsCommon,
	logging: false,
	migrations: [CoreSchema1757275174123],
});

export default AppDataSource;
