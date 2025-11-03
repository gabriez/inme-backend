import { Column, Entity } from "typeorm";

import { CoreEntity } from "./CoreEntity";

@Entity()
export class Client extends CoreEntity {
  @Column({
    length: 70,
    type: "varchar",
  })
  nombreContacto: string;

  @Column({
    length: 70,
    type: "varchar",
  })
  nombreEmpresa: string;

  @Column({
    type: "varchar",
    length: 22,
  })
  empresaTelefono: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  emailEmpresa: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  emailContacto: string;

  @Column({
    type: "varchar",
    length: 30,
    unique: true,
  })
  ciRif: string;

  @Column({
    type: "varchar",
    length: 350,
  })
  direccionFiscal: string;
}
