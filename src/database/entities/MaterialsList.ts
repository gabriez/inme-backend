import { Column, Entity, ManyToOne } from "typeorm";

import { CoreEntity } from "./CoreEntity";
import { Products } from "./Products";

@Entity()
export class MaterialsList extends CoreEntity {
  @Column({
    type: "float4",
    nullable: false,
  })
  public quantity: number;

  @ManyToOne(() => Products, (products) => products.id)
  public idProdCompuesto: Products;

  @ManyToOne(() => Products, (products) => products.id)
  public idProdComponente: Products;
}
