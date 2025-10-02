import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "@/database/databaseConfig";
/* migrations */
// import { CoreSeeder1649938942846 } from "./CoreSeders";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  migrations: [],
});

export default AppDataSource;
