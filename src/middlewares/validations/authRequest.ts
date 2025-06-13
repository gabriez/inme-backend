import type { Response } from 'express';
import type { IsignUpReq } from '../../typescript/express';

/* Validate that the data provided by the useris valid to process the request */
export function signUpRule(req: IsignUpReq, res: Response, next: () => void) {
	const resErr = res.status(422);
	const { password, username } = req.body ?? {};

	try {
		if (!password || !username) {
			resErr.json({
				status: false,
				message: 'El username y la contraseña son obligatorios',
			});

			return;
		}

		next();
	} catch {
		resErr.json({
			status: false,
			message: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde',
		});
	}
}
