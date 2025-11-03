import type { Products } from "./Products.js";

import { Column, Entity, ManyToMany } from "typeorm";

import { CoreEntity } from "./CoreEntity.js";

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
    length: 22,
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
    length: 30,
    unique: true,
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

  @ManyToMany(
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, unicorn/prefer-module
    () => require("./Products.js").Products,
  )
  products: Products[];
}
