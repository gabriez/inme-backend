import { Router } from 'express';

import { signIn, signUp } from '../controllers/AuthController';
import { isSuperAdmin, verifyToken } from '../middlewares/authJWT';
import { signUpRule } from '../middlewares/validations/authRequest';

export const authRoutes = (): Router => {
	const routerRoot = Router();

	/**
	 * @swagger
	 * /api/v1.0/auth/signup:
	 *   post:
	 *     summary: Crea un Nuevo Usuario
	 *     tags: [Usuarios]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             $ref: '#/components/schemas/Register'
	 *     security:
	 *      - bearerAuth: []
	 *     responses:
	 *       201:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *              type: object
	 *              $ref: '#/components/schemas/RegisterResponse'
	 *       422:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: string
	 *            example: "El usuario ya existe"
	 *       500:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: string
	 *            example: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde"
	 */
	routerRoot.post('/signup', [verifyToken, isSuperAdmin, signUpRule], signUp);

	/**
	 * @swagger
	 * /api/v1.0/auth/signin:
	 *   post:
	 *     summary: Inicio de sesión
	 *     tags: [Usuarios]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             $ref: '#/components/schemas/Login'
	 *     responses:
	 *       200:
	 *        description: Success!
	 *        content:
	 *          application/json:
	 *            schema:
	 *              type: object
	 *              properties:
	 *                token:
	 *                  type: string
	 *              example:
	 *                token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpZCI6MiwidXNlcm5hbWUiOiJEYXJrS2V2byIsImlhdCI6MTc0NzI2MTI0NSwiZXhwIjoxNzQ3MjYyMTQ1fQ.zF_1w7BdQUyzxR-mcmrdA5ibhw0SxdC5C_2JPRfAjgI
	 *       422:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: string
	 *            example: "Por favor envíe su username y contraseña | El usuario no existe"
	 *       400:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: string
	 *            example: "El username o la contraseña son incorrecto"
	 *       500:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: string
	 *            example: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde"
	 */
	routerRoot.post('/signin', signIn);

	return routerRoot;
};
