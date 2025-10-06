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

// TODO: Reescribir documentación, esta es pésima

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         verified:
 *           type: boolean
 *           description: Indica si el usuario está verificado
 *         rol:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: ID del rol
 *             rol:
 *               type: string
 *               enum: [SUPERADMIN, USER, READER]
 *               description: Tipo de rol del usuario
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Número total de usuarios encontrados
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *
 *     UpdateUser:
 *       type: object
 *       required:
 *         - password
 *         - username
 *         - email
 *         - name
 *         - rol
 *       properties:
 *         password:
 *           type: string
 *           minLength: 8
 *           description: La contraseña debe tener mínimo 8 caracteres
 *           example: "nuevaContraseña123"
 *         username:
 *           type: string
 *           minLength: 4
 *           description: Nombre de usuario único (mínimo 4 caracteres)
 *           example: "juanperez"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico válido
 *           example: "juan.perez@example.com"
 *         name:
 *           type: string
 *           minLength: 3
 *           description: Nombre completo del usuario (mínimo 3 caracteres)
 *           example: "Juan Pérez"
 *         rol:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             id:
 *               type: number
 *               description: ID del rol del usuario
 *               example: 1
 *
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: ID único del rol
 *         rol:
 *           type: string
 *           enum: [SUPERADMIN, USER, READER]
 *           description: Tipo de rol disponible
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *           example: "Error message or ['Error message 1', 'Error message 2']"
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operación exitosa"
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/User'
 *             - $ref: '#/components/schemas/UsersListResponse'
 *             - $ref: '#/components/schemas/UserResponse'
 *             - type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 */

/**
 * @swagger
 * /api/v1.0/user:
 *   get:
 *     summary: Obtener lista de usuarios (Solo SUPERADMIN)
 *     description: |
 *       Retorna una lista paginada de usuarios del sistema con opciones de filtrado por nombre, email, username y rol.
 *       Realiza búsquedas parciales (LIKE) en campos de texto.
 *     security:
 *       - BearerAuth: []
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Número máximo de usuarios a retornar (por defecto 10)
 *         example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Número de usuarios a omitir para paginación (por defecto 0)
 *         example: 0
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del usuario (búsqueda parcial, case-insensitive)
 *         example: "Juan"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por correo electrónico (búsqueda parcial, case-insensitive)
 *         example: "example.com"
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de usuario (búsqueda parcial, case-insensitive)
 *         example: "juanperez"
 *       - in: query
 *         name: rol
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del rol del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UsersListResponse'
 *             example:
 *               status: true
 *               data:
 *                 total: 25
 *                 users:
 *                   - id: 1
 *                     email: "juan.perez@example.com"
 *                     name: "Juan Pérez"
 *                     username: "juanperez"
 *                     verified: true
 *                     rol: { id: 1, rol: "USER" }
 *                   - id: 2
 *                     email: "admin@example.com"
 *                     name: "Administrador"
 *                     username: "admin"
 *                     verified: true
 *                     rol: { id: 2, rol: "SUPERADMIN" }
 *               message: "Usuarios obtenidos exitosamente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/v1.0/user/roles:
 *   get:
 *     summary: Obtener roles disponibles
 *     description: Retorna la lista completa de roles disponibles en el sistema
 *     security:
 *       - BearerAuth: []
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de roles obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         roles:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Role'
 *             example:
 *               status: true
 *               data:
 *                 roles:
 *                   - id: 1
 *                     rol: "SUPERADMIN"
 *                   - id: 2
 *                     rol: "USER"
 *                   - id: 3
 *                     rol: "READER"
 *               message: "Roles obtenidos exitosamente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/v1.0/user/{id}:
 *   get:
 *     summary: Obtener perfil de usuario (Solo SUPERADMIN)
 *     description: Obtiene la información completa de un usuario específico identificado por su ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d+$'
 *         description: ID numérico del usuario a consultar
 *         example: 1
 *     responses:
 *       200:
 *         description: Perfil de usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserResponse'
 *             example:
 *               status: true
 *               data:
 *                 user:
 *                   id: 1
 *                   email: "juan.perez@example.com"
 *                   name: "Juan Pérez"
 *                   username: "juanperez"
 *                   verified: true
 *                   rol: { id: 1, rol: "USER" }
 *               message: "Usuario obtenido exitosamente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: false
 *               message: "El usuario no existe"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Actualizar perfil de usuario (Solo SUPERADMIN)
 *     description: |
 *       Actualiza la información de un usuario existente.
 *       Valida que el email no esté en uso por otro usuario.
 *       Si la contraseña cambia, se actualiza. Si no cambia, se mantiene la actual.
 *     security:
 *       - BearerAuth: []
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d+$'
 *         description: ID numérico del usuario a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *           example:
 *             password: "nuevaContraseña123"
 *             username: "juanperez"
 *             email: "juan.perez@example.com"
 *             name: "Juan Pérez"
 *             rol: { id: 1 }
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserResponse'
 *             example:
 *               status: true
 *               data:
 *                 user:
 *                   id: 1
 *                   email: "juan.perez@example.com"
 *                   name: "Juan Pérez"
 *                   username: "juanperez"
 *                   verified: true
 *                   rol: { id: 1, rol: "USER" }
 *               message: "Usuario actualizado exitosamente"
 *       400:
 *         description: Error de validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Error de validación
 *                 value:
 *                   status: false
 *                   message: ["La contraseña debe tener mínimo 8 caracteres", "El email no es válido"]
 *               emptyBody:
 *                 summary: Cuerpo de solicitud vacío
 *                 value:
 *                   status: false
 *                   message: "No se proporcionaron datos en el cuerpo de solicitud"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: false
 *               message: "El usuario no existe"
 *       409:
 *         description: Conflicto - El correo electrónico ya está en uso por otro usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: false
 *               message: "El email ya está en uso"
 *       422:
 *         description: Error de validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emptyPassword:
 *                 summary: Contraseña vacía
 *                 value:
 *                   status: false
 *                   message: "La contraseña no puede ser una cadena vacía"
 *               invalidPassword:
 *                 summary: Contraseña inválida
 *                 value:
 *                   status: false
 *                   message: ["La contraseña debe tener mínimo 8 caracteres"]
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/v1.0/user/verify/{id}:
 *   patch:
 *     summary: Verificar usuario (Solo SUPERADMIN)
 *     description: Marca un usuario como verificado en el sistema cambiando el estado de verified a true
 *     security:
 *       - BearerAuth: []
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d+$'
 *         description: ID numérico del usuario a verificar
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: true
 *               message: "Usuario verificado exitosamente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: false
 *               message: "El usuario no existe"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

export const userRouters = () => {
  const routerRoot = Router();

  // Rutas
  routerRoot.get("/", [verifyToken, isSuperAdmin], GetUsers);
  routerRoot.get("/roles", [verifyToken, isSuperAdmin], GetRoles);

  routerRoot.patch(
    "/verify/:id",
    [verifyToken, isSuperAdmin, validateIdMiddleware],
    VerifyUser,
  );

  routerRoot
    .route("/:id")
    .put(
      [verifyToken, isSuperAdmin, validateIdMiddleware, editUserMiddleware],
      EditProfile,
    )
    .get([verifyToken, isSuperAdmin, validateIdMiddleware], GetProfile);

  return routerRoot;
};
