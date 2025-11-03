import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "../databaseConfig.js";
import { CoreSeeder1649938942846 } from "./CoreSeders.js";
/* migrations */
// import { CoreSeeder1649938942846 } from "./CoreSeders";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  migrations: [CoreSeeder1649938942846],
});

export default AppDataSource;
