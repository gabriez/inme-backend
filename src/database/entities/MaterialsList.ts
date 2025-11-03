import type { Products } from "./Products.js";

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { CoreEntity } from "./CoreEntity.js";

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

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Products.js").Products,
    (products: Products) => products.id,
    { lazy: true },
  )
  @JoinColumn({ name: "idProdCompuestoId" })
  public idProdCompuesto: Partial<Products>;

  @Column({
    type: "number",
  })
  public idProdComponenteId: number;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Products.js").Products,
    (products: Products) => products.id,
  )
  @JoinColumn({ name: "idProdComponenteId" })
  public componentProduct: Products;
}
