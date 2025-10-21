import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig";
/* migrations */
import { CoreSchema1759173510552 } from "./migrations/1759173510552-coreSchema";
import { FixRelationsAndEnums1759643221781 } from "./migrations/1759643221781-fix-relations-and-enums";
import { FixEnumHistorial1759643952609 } from "./migrations/1759643952609-fix-enum-historial";
import { AddVerifiedField1759704235151 } from "./migrations/1759704235151-add-verified-field";
import { NullDatesOrders1761006962234 } from "./migrations/1761006962234-nullDatesOrders";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  logging: false,
  migrations: [
    CoreSchema1759173510552,
    FixRelationsAndEnums1759643221781,
    FixEnumHistorial1759643952609,
    AddVerifiedField1759704235151,
    NullDatesOrders1761006962234,
  ],
});

export default AppDataSource;
