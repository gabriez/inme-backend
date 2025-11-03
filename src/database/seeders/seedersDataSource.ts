import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "../databaseConfig";
import { CoreSeeder1649938942846 } from "./CoreSeders";
/* migrations */
// import { CoreSeeder1649938942846 } from "./CoreSeders";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  migrations: [CoreSeeder1649938942846],
});

export default AppDataSource;
