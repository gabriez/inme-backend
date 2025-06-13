import bcrypt from 'bcryptjs';
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { CoreEntity } from './CoreEntity';
import { Roles } from './Roles';

@Entity()
export class Users extends CoreEntity {
	@Column({
		length: 50,
		nullable: true,
		type: 'varchar',
	})
	name: string;

	@Column({
		length: 50,
		unique: true,
		type: 'varchar',
	})
	username: string;

	@ManyToMany(() => Roles, {
		eager: true,
	})
	@JoinTable()
	rol: Roles[];

	@Column({
		type: 'varchar',
		length: 150,
	})
	password: string;

	@BeforeInsert()
	async encryptPassword() {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	}

	async comparePassword(password: string) {
		return bcrypt.compare(password, this.password);
	}
}
