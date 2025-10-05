import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { CoreSchema1759173510552 } from "./migrations/1759173510552-coreSchema";
import { FixRelationsAndEnums1759643221781 } from "./migrations/1759643221781-fix-relations-and-enums";
import { FixEnumHistorial1759643952609 } from "./migrations/1759643952609-fix-enum-historial";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  logging: false,
  migrations: [
    CoreSchema1759173510552,
    FixRelationsAndEnums1759643221781,
    FixEnumHistorial1759643952609,
  ],
});

export default AppDataSource;
