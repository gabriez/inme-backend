import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CoreEntity } from "./CoreEntity";

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
    unique: true,
    length: 100,
  })
  nombre: string;

  @Column({
    type: "int",
  })
  existencia: number;

  @Column({
    type: "varchar",
    length: 50,
  })
  measureUnit: string;

  @Column({
    type: "varchar",
    unique: true,
    length: 500,
  })
  planos: string;

  @ManyToOne(() => Products, (products) => products.resourcesList)
  product: Products;

  @OneToMany(() => Products, (product) => product.product)
  resourcesList: Products[];
}
