import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { CoreEntity } from "./CoreEntity";
import { Products } from "./Products";

enum OrderState {
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
  })
  startDate: Date;

  @Column({
    type: "date",
  })
  endDate: Date;

  @Column({
    type: "date",
  })
  realEndDate: Date;

  @Column({
    type: "varchar",
    length: 400,
  })
  responsables: string;

  @OneToOne(() => Products)
  @JoinColumn()
  product: Products;
}
