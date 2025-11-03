import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Client } from "./Client";
import { CoreEntity } from "./CoreEntity";
import { ProductionOrders } from "./ProductionOrders";
import { Products } from "./Products";
import { Providers } from "./Providers";

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

  @ManyToOne(() => Products, { nullable: true })
  @JoinColumn()
  product?: Products;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn()
  client?: Client;

  @ManyToOne(() => Providers, { nullable: true })
  @JoinColumn()
  provider?: Providers;

  @ManyToOne(() => ProductionOrders, { nullable: true })
  @JoinColumn()
  productionOrder?: ProductionOrders;
}
