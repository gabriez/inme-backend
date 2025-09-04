import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { InmeStart1755574936345 } from "./migrations/1755574936345-inme-start";
import { MigrateUsers1756786682066 } from "./migrations/1756786682066-migrate-users";

const AppDataSource = new DataSource({
	...dataSourceOptionsCommon,
	logging: false,
	migrations: [InmeStart1755574936345, MigrateUsers1756786682066],
});

export default AppDataSource;
