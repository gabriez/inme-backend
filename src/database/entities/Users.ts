import bcrypt from "bcryptjs";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
} from "typeorm";

import { CoreEntity } from "./CoreEntity";
import { Roles } from "./Roles";

@Entity()
export class Users extends CoreEntity {
  @Column({
    length: 50,
    nullable: true,
    type: "varchar",
  })
  name: string;

  @Column({
    length: 50,
    unique: true,
    type: "varchar",
  })
  username: string;

  @Column({
    type: "varchar",
    length: 150,
    unique: true,
  })
  email: string;

  @ManyToMany(() => Roles, {
    eager: true,
  })
  @JoinTable()
  rol: Roles[];

  @Column({
    type: "varchar",
    length: 150,
  })
  password: string;

  @Column({
    type: "boolean",
    default: false,
  })
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async encryptPassword() {
    // Solo encriptar si la contraseña ha cambiado (no está ya hasheada)
    if (this.password && !this.password.startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
}
