import { DataSource } from 'typeorm';

import { dataSourceOptionsCommon } from './databaseConfig';
/* migrations */
import { CoreSchema1649955218198 } from './migrations/1649955218198-CoreSchema';

const AppDataSource = new DataSource({
	...dataSourceOptionsCommon,
	logging: false,
	migrations: [CoreSchema1649955218198],
});

export default AppDataSource;
