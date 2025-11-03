import type { MaterialsList } from "./MaterialsList.js";
import type { Providers } from "./Providers.js";

import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";

import { CoreEntity } from "./CoreEntity.js";

export enum ProductType {
  INSUMOS = "insumos",
  SENCILLOS = "sencillos",
  COMPUESTOS = "compuestos",
}

export interface ImageProducts {
  uri: string;
  width: number;
  height: number;
}

@Entity()
export class Products extends CoreEntity {
  @Column({
    type: "varchar",
    unique: true,
    length: 50,
  })
  codigo: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  nombre: string;

  @Column({
    type: "float",
  })
  existencia: number;

  @Column({
    type: "float",
  })
  existenciaReservada: number;

  @Column({
    type: "varchar",
    length: 50,
  })
  measureUnit: string;

  @Column({
    type: "varchar",
    length: 500,
  })
  planos: string;

  @Column({
    type: "json",
    nullable: true,
  })
  imageUri: ImageProducts;

  @Column({
    type: "enum",
    enum: ProductType,
  })
  productType: ProductType;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./MaterialsList.js").MaterialsList,
    (materialsList: MaterialsList) => materialsList.idProdCompuesto,
    { cascade: ["insert"] },
  )
  public materialsList: MaterialsList[];

  @ManyToMany(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Providers.js").Providers,
    (providers: Providers) => providers.id,
  )
  @JoinTable({
    name: "providers_products_products",
  })
  providers: Providers[];
}
