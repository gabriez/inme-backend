import { Column, Entity } from "typeorm";
import { CoreEntity } from "./CoreEntity";

@Entity()
export class Client extends CoreEntity {
	@Column({
		length: 70,
		type: "varchar",
	})
	nombre: string;

	@Column({
		length: 50,
		type: "varchar",
	})
	nombreEmpresa: string;

	@Column({
		type: "varchar",
		length: 150,
	})
	personaContacto: string;

	@Column({
		type: "varchar",
		length: 150,
	})
	empresaTelefono: string;

	@Column({
		type: "varchar",
		length: 150,
	})
	email: string;

	@Column({
		type: "varchar",
		length: 150,
	})
	ciRif: string;
}
