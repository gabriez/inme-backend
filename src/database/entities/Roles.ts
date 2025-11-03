import { Column, Entity } from "typeorm";

import { CoreEntity } from "./CoreEntity.js";

@Entity()
export class Roles extends CoreEntity {
  @Column({
    length: 50,
    unique: true,
    type: "varchar",
  })
  rol: string;
}
