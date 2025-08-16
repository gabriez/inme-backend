import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { CoreEntity } from "./CoreEntity";
import { Products } from "./Products";
import { Client } from "./Client";
import { Providers } from "./Providers";
import { ProductionOrders } from "./ProductionOrders";

enum HistorialAction {
	INGRESO = "ingreso",
	EGRESO = "egreso",
	ORDENPRODUCCION = "Order de producción",
}

@Entity()
export class Historial extends CoreEntity {
	@Column({
		type: "varchar",
		length: 300,
	})
	description: string;

	@Column({
		type: "enum",
		enum: HistorialAction,
	})
	action: HistorialAction;

	@Column({
		type: "int",
	})
	cantidad: number;

	@OneToOne(() => Products)
	@JoinColumn()
	product: Products;

	@OneToOne(() => Client)
	@JoinColumn()
	client: Client;

	@OneToOne(() => Providers)
	@JoinColumn()
	provider: Providers;

	@OneToOne(() => ProductionOrders)
	@JoinColumn()
	productionOrder: ProductionOrders;
}
