import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { CoreEntity } from "./CoreEntity";
import { Products } from "./Products";

@Entity()
export class Providers extends CoreEntity {
  @Column({
    type: "varchar",
    length: 100,
  })
  enterpriseName: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  personContact: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  enterprisePhone: string;

  @Column({
    type: "varchar",
    length: 400,
  })
  description: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  email: string;

  @Column({
    type: "varchar",
    length: 50,
  })
  ciRif: string;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  taxAddress: string;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  address: string;

  @Column({
    type: "varchar",
    length: 300,
    nullable: true,
  })
  website: string;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  instagram: string;

  @ManyToMany(() => Products)
  @JoinTable()
  products: Products[];
}
