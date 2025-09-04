import { Router } from "express";

import { signIn, signUp } from "../controllers/AuthController";
import { signUpRule } from "../middlewares/validations/authRequest";

/**
 * @swagger
 * components:
 *   schemas:
 *     GenericResponseSchema:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         data:
 *           oneOf:
 *             - type: object
 *               description: Datos de la respuesta
 *             - type: null
 *               description: Nulo en caso de error
 *         message:
 *           anyOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *     Login:
 *       type: object
 *       required:
 *         - password
 *         - username
 *       properties:
 *         password:
 *           type: string
 *           description: Contraseña del Usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario o email
 *       example:
 *         password: "Ganador123$"
 *         username: "LuisCalvito"
 *     Register:
 *       type: object
 *       required:
 *         - name
 *         - password
 *         - username
 *         - email
 *       properties:
 *         password:
 *           type: string
 *           description: Contraseña del Usuario
 *         username:
 *           type: string
 *           description: Nombre de Usuario
 *         name:
 *           type: string
 *           description: Nombre Completo del Usuario
 *         email:
 *           type: string
 *           description: Correo Electrónico del Usuario
 *       example:
 *         password: "Ganador123$"
 *         username: "LuisCalvito"
 *         name: "Luis Mogollon"
 *         email: "inme@gmail.com"
 */
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
	 *              $ref: '#/components/schemas/GenericResponseSchema'
	 *       422:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: object
	 *              $ref: '#/components/schemas/GenericResponseSchema'
	 *            examples:
	 *               usuarioExistente:
	 *                 summary: El usuario existe
	 *                 value:
	 *                   status: false
	 *                   data: null
	 *                   message: "El usuario ya existe"
	 *               erroresValidacion:
	 *                 summary: Resumen de todos los mensajes de error
	 *                 value:
	 *                   status: false
	 *                   data: null
	 *                   message: ["La contraseña es obligatoria", "La contraseña debe tener mínimo 8 caracteres", "El username es obligatorio", "El username debe ser mayor de 4 caracteres", "El email no es válido", "El nombre es obligatorio", "El nombre debe ser mayor de 3 caracteres"]
	 *       500:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: string
	 *            example: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde"
	 */
	routerRoot.post("/signup", [signUpRule], signUp);

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
	 *              type: object
	 *              $ref: '#/components/schemas/GenericResponseSchema'
	 *            examples:
	 *              example1:
	 *                summary: Faltan datos
	 *                value:
	 *                  status: false
	 *                  data: null
	 *                  message: "Por favor envíe su username/email y contraseña"
	 *              example2:
	 *                summary: El usuario no existe
	 *                value:
	 *                  status: false
	 *                  data: null
	 *                  message: "El usuario no existe"
	 *       400:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: object
	 *              $ref: '#/components/schemas/GenericResponseSchema'
	 *            example:
	 *              message: "El username o la contraseña son incorrecto"
	 *              status: false
	 *              data: null
	 *       500:
	 *        content:
	 *          text/plain; charset=utf-8:
	 *            schema:
	 *              type: object
	 *              $ref: '#/components/schemas/GenericResponseSchema'
	 *            example:
	 *              message: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde"
	 *              status: false
	 *              data: null
	 */
	routerRoot.post("/signin", signIn);

	return routerRoot;
};
