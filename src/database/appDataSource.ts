import { DataSource } from "typeorm";

import { dataSourceOptionsCommon } from "./databaseConfig.js";
/* migrations */
import { CoreSchema1759173510552 } from "./migrations/1759173510552-coreSchema.js";
import { FixRelationsAndEnums1759643221781 } from "./migrations/1759643221781-fix-relations-and-enums.js";
import { FixEnumHistorial1759643952609 } from "./migrations/1759643952609-fix-enum-historial.js";
import { AddVerifiedField1759704235151 } from "./migrations/1759704235151-add-verified-field.js";
import { NullDatesOrders1761006962234 } from "./migrations/1761006962234-nullDatesOrders.js";
import { ProductImages1761781443756 } from "./migrations/1761781443756-product-images.js";
import { FixMigrationImage1761782358505 } from "./migrations/1761782358505-fix-migration-image.js";

const AppDataSource = new DataSource({
  ...dataSourceOptionsCommon,
  logging: false,
  migrations: [
    CoreSchema1759173510552,
    FixRelationsAndEnums1759643221781,
    FixEnumHistorial1759643952609,
    AddVerifiedField1759704235151,
    NullDatesOrders1761006962234,
    ProductImages1761781443756,
    FixMigrationImage1761782358505,
  ],
});

export default AppDataSource;
