/* types */
import type { Users } from "../database/entities/Users";
import type {
	IsignInReq,
	IsignUpReq,
	ResponseAPI,
} from "../typescript/express";

import jwt from "jsonwebtoken";

import { jwtSecret } from "../constants";
import UserRepository from "../database/repositories/UserRepository";

export function createToken(user: Users) {
	const { id, username } = user;
	return jwt.sign({ username, id }, jwtSecret, {
		expiresIn: 86_400 /* 1 day */,
	});
}

export const signUp = async (req: IsignUpReq, res: ResponseAPI) => {
	try {
		const { password, username, name, email } = req.body ?? {};

		if (!username) {
			res.status(422).json({
				data: null,
				status: false,
				message: "Por favor envíe su username",
			});

			return;
		}

		const user = await UserRepository.findOneBy([{ username }, { email }]);
		if (user) {
			let message = [];
			if (user.username === username) {
				message.push("El usuario ya existe");
			}
			if (user.email === email) {
				message.push("El email ya está en uso");
			}

			res.status(422).json({
				data: null,
				status: false,
				message,
			});

			return;
		}

		const newUser = UserRepository.create({
			name,
			username,
			password,
			email,
		});

		await UserRepository.save(newUser);

		res.status(201).json({
			status: true,
			data: {
				name: newUser.name,
				username: newUser.username,
				email: newUser.email,
			},
			message: "Success!",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: false,
			message: [
				"Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
			],
		});
	}
};

export const signIn = async (req: IsignInReq, res: ResponseAPI) => {
	try {
		// Se acepta email o nombre de usuario
		const { username, password } = req.body ?? {};

		if (!username || !password) {
			res.status(422).json({
				data: null,
				status: false,
				message: "Por favor envíe su username/email y contraseña",
			});

			return;
		}

		const user = await UserRepository.findOneBy([
			{ username },
			{ email: username },
		]);

		if (!user) {
			res.status(422).json({
				data: null,
				status: false,
				message: "El usuario no existe",
			});

			return;
		}

		const isMatch = await user.comparePassword(password);

		if (isMatch) {
			res.status(200).json({
				status: true,
				message: "Success!",
				data: { token: createToken(user) },
			});
		} else {
			res.status(400).json({
				status: false,
				message: "El username o la contraseña son incorrecto",
			});
		}
	} catch (error) {
		console.log("Error in signIn:", error);
		res.status(500).json({
			status: false,
			message:
				"Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
		});
	}
};
