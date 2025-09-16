import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { Client } from "./Client";
import { CoreEntity } from "./CoreEntity";
import { ProductionOrders } from "./ProductionOrders";
import { Products } from "./Products";
import { Providers } from "./Providers";

enum HistorialAction {
  INGRESO = "ingreso",
  EGRESO = "egreso",
  ORDENPRODUCCION = "Order de producción",
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

  @OneToOne(() => Products)
  @JoinColumn()
  product: Products;

  @OneToOne(() => Client)
  @JoinColumn()
  client: Client;

  @OneToOne(() => Providers)
  @JoinColumn()
  provider: Providers;

  @OneToOne(() => ProductionOrders)
  @JoinColumn()
  productionOrder: ProductionOrders;
}
