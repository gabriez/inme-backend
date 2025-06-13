import { Column, Entity } from 'typeorm';

import { CoreEntity } from './CoreEntity';

@Entity()
export class Roles extends CoreEntity {
	@Column({
		length: 50,
		unique: true,
		type: 'varchar',
	})
	rol: string;
}
