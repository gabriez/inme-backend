import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { CoreEntity } from "./CoreEntity";
import { Products } from "./Products";

@Entity()
export class MaterialsList extends CoreEntity {
  @Column({
    type: "float4",
    nullable: false,
  })
  public quantity: number;

  @Column({
    type: "number",
  }) // <-- Esta es la columna real en la tabla
  public idProdCompuestoId: number;

  @ManyToOne(() => Products, (products) => products.id, { lazy: true })
  @JoinColumn({ name: "idProdCompuestoId" })
  public idProdCompuesto: Partial<Products>;

  @Column({
    type: "number",
  })
  public idProdComponenteId: number;

  @ManyToOne(() => Products, (products) => products.id, { lazy: true })
  @JoinColumn({ name: "idProdComponenteId" })
  public idProdComponente: Partial<Products>;
}
