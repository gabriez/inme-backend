import type { Products } from "./Products.js";

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { CoreEntity } from "./CoreEntity.js";

export enum OrderState {
  EnProceso = "En proceso",
  Ejecutada = "Ejecutada",
  Cancelada = "Cancelada",
  PorIniciar = "Por iniciar",
}

@Entity()
export class ProductionOrders extends CoreEntity {
  @Column({
    type: "int",
  })
  cantidadProductoFabricado: number;

  @Column({
    type: "enum",
    enum: OrderState,
    default: OrderState.PorIniciar,
  })
  orderState: OrderState;

  @Column({
    type: "date",
    nullable: true,
  })
  startDate?: Date;

  @Column({
    type: "date",
  })
  endDate: Date;

  @Column({
    type: "date",
    nullable: true,
  })
  realEndDate?: Date;

  @Column({
    type: "varchar",
    length: 400,
  })
  responsables: string;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Products.js").Products,
  )
  @JoinColumn()
  product: Products;
}
