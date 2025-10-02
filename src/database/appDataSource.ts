import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { CoreSchema1759173510552 } from "./migrations/1759173510552-coreSchema";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  logging: false,
  migrations: [CoreSchema1759173510552],
});

export default AppDataSource;
