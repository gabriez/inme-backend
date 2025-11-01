import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";

import { CoreEntity } from "./CoreEntity";
import { MaterialsList } from "./MaterialsList";
import { Providers } from "./Providers";

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
    () => MaterialsList,
    (materialsList) => materialsList.idProdCompuesto,
    { cascade: ["insert"] },
  )
  public materialsList: MaterialsList[];

  @ManyToMany(() => Providers, (providers) => providers.id)
  @JoinTable({
    name: "providers_products_products",
  })
  providers: Providers[];
}
