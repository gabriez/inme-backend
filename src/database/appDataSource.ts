import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { NewMigration1757562354082 } from "./migrations/1757562354082-new-migration";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  logging: false,
  migrations: [NewMigration1757562354082],
});

export default AppDataSource;
