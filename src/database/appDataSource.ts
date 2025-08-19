import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { InmeStart1755574936345 } from "./migrations/1755574936345-inme-start";

const AppDataSource = new DataSource({
	...dataSourceOptionsCommon,
	logging: false,
	migrations: [InmeStart1755574936345],
});

export default AppDataSource;
