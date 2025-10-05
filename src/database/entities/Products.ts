import { Column, Entity, ManyToMany, OneToMany } from "typeorm";

import { CoreEntity } from "./CoreEntity";
import { MaterialsList } from "./MaterialsList";
import { Providers } from "./Providers";

export enum ProductType {
  INSUMOS = "insumos",
  SENCILLOS = "sencillos",
  COMPUESTOS = "compuestos",
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
    type: "enum",
    enum: ProductType,
  })
  productType: ProductType;

  @OneToMany(
    () => MaterialsList,
    (materialsList) => materialsList.idProdComponente,
  )
  public materialsList: MaterialsList[];

  @ManyToMany(() => Providers, (providers) => providers.id)
  providers: Providers[];
}
