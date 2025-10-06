import { Router } from "express";

import { validateIdMiddleware } from "@/middlewares/validations/generalValidationMiddlewares";
import { editUserMiddleware } from "@/middlewares/validations/usersRequestMiddleware";
import {
  EditProfile,
  GetProfile,
  GetRoles,
  GetUsers,
  VerifyUser,
} from "../controllers/UserController";
import { isSuperAdmin, verifyToken } from "../middlewares/authJWT";

/**
 * @swagger
 * components:
 *   schemas:
 *    EditUser:
 *     type: object
 *     required:
 *      - password
 *      - username
 *      - email
 *      - name
 *      - rol
 *     properties:
 *      password:
 *        type: string
 *        description: Contraseña del usuario
 *      username:
 *        type: string
 *        description: Nombre de usuario
 *      email:
 *        type: string
 *        description: Correo electrónico del usuario
 *      name:
 *        type: string
 *        description: Nombre completo del usuario
 *      rol:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *            description: ID del rol a asignar
 *     example:
 *      password: "newpassword123"
 *      username: "newuser"
 *      email: "user@example.com"
 *      name: "New User Name"
 *      rol: { "id": 3 }
 */

export const userRouters = () => {
  const routerRoot = Router();

  // Rutas
  /**
   * @swagger
   * /api/v1.0/user:
   *  get:
   *   summary: Obtener todos los usuarios
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: query
   *      name: limit
   *      schema:
   *       type: number
   *      description: Número máximo de usuarios a retornar (por defecto 10)
   *    - in: query
   *      name: offset
   *      schema:
   *       type: number
   *      description: Número de usuarios a omitir (por defecto 0)
   *    - in: query
   *      name: email
   *      schema:
   *       type: string
   *      description: Filtrar por email de usuario
   *    - in: query
   *      name: nombre
   *      schema:
   *       type: string
   *      description: Filtrar por nombre de usuario
   *    - in: query
   *      name: username
   *      schema:
   *       type: string
   *      description: Filtrar por username
   *    - in: query
   *      name: rol
   *      schema:
   *       type: number
   *      description: Filtrar por ID de rol
   *   responses:
   *    200:
   *     description: Lista de usuarios obtenida exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Usuarios obtenidos exitosamente"
   *        data: {
   *         users: [{
   *          id: 1,
   *          email: "user@example.com",
   *          name: "John Doe",
   *          username: "johndoe",
   *          verified: true,
   *          rol: { id: 3, rol: "SUPERADMIN" }
   *         }],
   *         total: 1
   *        }
   *    401:
   *     description: Unauthorized
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot.get("/", [verifyToken, isSuperAdmin], GetUsers);

  /**
   * @swagger
   * /api/v1.0/user/roles:
   *  get:
   *   summary: Obtener todos los roles de usuario
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   responses:
   *    200:
   *     description: Lista de roles obtenida exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Roles obtenidos exitosamente"
   *        data: {
   *         roles: [
   *          { id: 1, rol: "READER" },
   *          { id: 2, rol: "USER" },
   *          { id: 3, rol: "SUPERADMIN" }
   *         ]
   *        }
   *    401:
   *     description: Unauthorized
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot.get("/roles", [verifyToken, isSuperAdmin], GetRoles);

  /**
   * @swagger
   * /api/v1.0/user/verify/{id}:
   *  patch:
   *   summary: Verificar un usuario por su ID
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del usuario a verificar
   *      required: true
   *   responses:
   *    200:
   *     description: Usuario verificado exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Usuario verificado exitosamente"
   *    400:
   *     description: Bad Request
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    401:
   *     description: Unauthorized
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    404:
   *     description: Not Found
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El usuario no existe"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot.patch(
    "/verify/:id",
    [verifyToken, isSuperAdmin, validateIdMiddleware],
    VerifyUser,
  );

  /**
   * @swagger
   * /api/v1.0/user/{id}:
   *  put:
   *   summary: Actualizar un usuario por ID
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del usuario a actualizar
   *      required: true
   *   requestBody:
   *     required: true
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/EditUser'
   *   responses:
   *    200:
   *     description: Usuario actualizado exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Usuario obtenido exitosamente"
   *        data: {
   *         user: {
   *          id: 1,
   *          email: "user@example.com",
   *          name: "John Doe",
   *          username: "johndoe",
   *          verified: true,
   *          rol: { id: 3, rol: "SUPERADMIN" }
   *         }
   *        }
   *    400:
   *     description: Bad Request
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    401:
   *     description: Unauthorized
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    404:
   *     description: Not Found
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El usuario no existe"
   *    422:
   *     description: Unprocessable Entity
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       examples:
   *        invalidBody:
   *         summary: Cuerpo de solicitud inválido
   *         value:
   *          status: false
   *          data: null
   *          message: ["La contraseña es obligatoria", "La contraseña debe tener mínimo 8 caracteres", "El username es obligatorio", "El username debe ser mayor de 4 caracteres", "El email no es válido", "El nombre es obligatorio", "El nombre debe ser mayor de 3 caracteres", "El id del rol es obligatorio y debe ser un numero"]
   *        emptyBody:
   *         summary: El cuerpo de la solicitud está vacío
   *         value:
   *          status: false
   *          data: null
   *          message: "No se proporcionaron datos en el cuerpo de solicitud"
   *        emailInUse:
   *         summary: El email ya está en uso
   *         value:
   *          status: false
   *          data: null
   *          message: "El email ya está en uso"
   *        emptyPassword:
   *         summary: La contraseña no puede estar vacía
   *         value:
   *          status: false
   *          data: null
   *          message: "La contraseña no puede ser una cadena vacía"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *  get:
   *   summary: Obtener un usuario por ID
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del usuario
   *      required: true
   *   responses:
   *    200:
   *     description: Usuario obtenido exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Usuario obtenido exitosamente"
   *        data: {
   *         user: {
   *          id: 1,
   *          email: "user@example.com",
   *          name: "John Doe",
   *          verified: true,
   *          rol: { id: 2, rol: "USER" }
   *         }
   *        }
   *    400:
   *     description: Bad Request
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    401:
   *     description: Unauthorized
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    404:
   *     description: Not Found
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El usuario no existe"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot
    .route("/:id")
    .put(
      [verifyToken, isSuperAdmin, validateIdMiddleware, editUserMiddleware],
      EditProfile,
    )
    .get([verifyToken, isSuperAdmin, validateIdMiddleware], GetProfile);

  return routerRoot;
};
