import type { RequestAPI, ResponseAPI } from '../typescript/express';

export const profile = (req: RequestAPI, res: ResponseAPI) => {
	res.status(200).json({
		status: true,
		data: req.user,
		message: 'Éxito!',
	});
};
