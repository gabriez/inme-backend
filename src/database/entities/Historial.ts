import type { Client } from "./Client.js";
import type { ProductionOrders } from "./ProductionOrders.js";
import type { Products } from "./Products.js";
import type { Providers } from "./Providers.js";

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { CoreEntity } from "./CoreEntity.js";

export enum HistorialAction {
  INGRESO = "ingreso",
  EGRESO = "egreso",
  VENTA = "venta",
  ORDENPRODUCCION = "Orden de producción",
  VARIOS = "varios",
  GASTODEPRODUCCION = "Gasto por orden de producción",
  INGRESOPORPRODUCCION = "Ingreso por producción",
}

@Entity()
export class Historial extends CoreEntity {
  @Column({
    type: "varchar",
    length: 300,
  })
  description: string;

  @Column({
    type: "enum",
    enum: HistorialAction,
  })
  action: HistorialAction;

  @Column({
    type: "int",
  })
  cantidad: number;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Products.js").Products,
    { nullable: true },
  )
  @JoinColumn()
  product?: Products;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Client.js").Client,
    { nullable: true },
  )
  @JoinColumn()
  client?: Client;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Providers.js").Providers,
    { nullable: true },
  )
  @JoinColumn()
  provider?: Providers;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./ProductionOrders.js").ProductionOrders,
    { nullable: true },
  )
  @JoinColumn()
  productionOrder?: ProductionOrders;
}
