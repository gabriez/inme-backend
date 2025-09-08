import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { CoreSchema1757306852147 } from "./migrations/1757306852147-coreSchema";

const AppDataSource = new DataSource({
	...dataSourceOptionsCommon,
	logging: false,
	migrations: [CoreSchema1757306852147],
});

export default AppDataSource;
