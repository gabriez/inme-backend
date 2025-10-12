import { Router } from "express";

import { validateIdMiddleware } from "@/middlewares/validations/generalValidationMiddlewares";
import {
  createUserMiddleware,
  editUserMiddleware,
} from "@/middlewares/validations/usersRequestMiddleware";
import {
  createUser,
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
 *     description: Modelo de datos para crear o editar un usuario.
 *     required:
 *      - password
 *      - username
 *      - email
 *      - name
 *      - rol
 *     properties:
 *      password:
 *        type: string
 *        description: Contraseña del usuario. Debe tener al menos 8 caracteres.
 *      username:
 *        type: string
 *        description: Nombre de usuario único. Debe tener al menos 4 caracteres.
 *      email:
 *        type: string
 *        format: email
 *        description: Correo electrónico único del usuario.
 *      name:
 *        type: string
 *        description: Nombre completo del usuario. Debe tener al menos 3 caracteres.
 *      rol:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *            description: ID del rol a asignar al usuario.
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
   *   summary: Obtener una lista de usuarios
   *   description: Retorna una lista paginada de usuarios, con la opción de filtrar por email, nombre, nombre de usuario y rol.
   *   operationId: getUsers
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: query
   *      name: limit
   *      schema:
   *       type: integer
   *       default: 10
   *      description: Número máximo de usuarios a retornar.
   *    - in: query
   *      name: offset
   *      schema:
   *       type: integer
   *       default: 0
   *      description: Número de usuarios a omitir para la paginación.
   *    - in: query
   *      name: email
   *      schema:
   *       type: string
   *      description: Filtrar usuarios por su correo electrónico.
   *    - in: query
   *      name: nombre
   *      schema:
   *       type: string
   *      description: Filtrar usuarios por su nombre.
   *    - in: query
   *      name: username
   *      schema:
   *       type: string
   *      description: Filtrar usuarios por su nombre de usuario.
   *    - in: query
   *      name: rol
   *      schema:
   *       type: integer
   *      description: Filtrar usuarios por el ID de su rol.
   *   responses:
   *    200:
   *     description: OK. Lista de usuarios obtenida exitosamente.
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
   *     description: Unauthorized. El token de autenticación no es válido o no se proporcionó.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden. El usuario no tiene permisos para acceder a este recurso.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    500:
   *     description: Internal Server Error. Ocurrió un error inesperado en el servidor.
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot
    .get("/", [verifyToken, isSuperAdmin], GetUsers)
    /**
     * @swagger
     * /api/v1.0/user:
     *  post:
     *   summary: Crear un nuevo usuario
     *   description: Crea un nuevo usuario en el sistema con la información proporcionada.
     *   operationId: createUser
     *   tags: [Usuarios]
     *   security:
     *     - BearerAuth: []
     *   requestBody:
     *     required: true
     *     description: Datos del usuario a crear.
     *     content:
     *       application/json:
     *         schema:
     *           $ref: '#/components/schemas/EditUser'
     *   responses:
     *    201:
     *     description: Created. El usuario fue creado exitosamente.
     *     content:
     *      application/json:
     *       schema:
     *        $ref: '#/components/schemas/GenericResponseSchema'
     *       example:
     *        status: true
     *        message: "Usuario creado exitosamente"
     *        data: {
     *         user: {
     *          id: 1,
     *          email: "user@example.com",
     *          name: "John Doe",
     *          username: "johndoe",
     *          verified: false,
     *          rol: { id: 3, rol: "USER" }
     *         }
     *        }
     *    401:
     *     description: Unauthorized. El token de autenticación no es válido o no se proporcionó.
     *     content:
     *      application/json:
     *       schema:
     *        $ref: '#/components/schemas/ErrorValidationToken'
     *    403:
     *     description: Forbidden. El usuario no tiene permisos para crear nuevos usuarios.
     *     content:
     *      application/json:
     *       schema:
     *        $ref: '#/components/schemas/ErrorSecuritySchema'
     *    422:
     *     description: Unprocessable Entity. Los datos proporcionados no son válidos.
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
     *        emailInUse:
     *         summary: El email ya está en uso
     *         value:
     *          status: false
     *          data: null
     *          message: "El email ya está en uso"
     *    500:
     *     description: Internal Server Error. Ocurrió un error inesperado en el servidor.
     *     content:
     *      text/plain; charset=utf-8:
     *       schema:
     *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
     */
    .post("/", [verifyToken, isSuperAdmin, createUserMiddleware], createUser);

  /**
   * @swagger
   * /api/v1.0/user/roles:
   *  get:
   *   summary: Obtener todos los roles de usuario
   *   description: Retorna una lista de todos los roles de usuario disponibles en el sistema.
   *   operationId: getRoles
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   responses:
   *    200:
   *     description: OK. Lista de roles obtenida exitosamente.
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
   *     description: Unauthorized. El token de autenticación no es válido o no se proporcionó.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden. El usuario no tiene permisos para acceder a este recurso.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    500:
   *     description: Internal Server Error. Ocurrió un error inesperado en el servidor.
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
   *   description: Cambia el estado de verificación de un usuario a `true`.
   *   operationId: verifyUser
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: integer
   *      description: ID numérico del usuario a verificar.
   *      required: true
   *   responses:
   *    200:
   *     description: OK. Usuario verificado exitosamente.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Usuario verificado exitosamente"
   *    400:
   *     description: Bad Request. El ID proporcionado no es un número válido.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    401:
   *     description: Unauthorized. El token de autenticación no es válido o no se proporcionó.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden. El usuario no tiene permisos para verificar a otros usuarios.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    404:
   *     description: Not Found. No se encontró ningún usuario con el ID proporcionado.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El usuario no existe"
   *    500:
   *     description: Internal Server Error. Ocurrió un error inesperado en el servidor.
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
   *   summary: Actualizar un usuario por su ID
   *   description: Actualiza la información de un usuario existente a partir de su ID.
   *   operationId: updateUser
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: integer
   *      description: ID numérico del usuario a actualizar.
   *      required: true
   *   requestBody:
   *     required: true
   *     description: Datos del usuario a actualizar.
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/EditUser'
   *   responses:
   *    200:
   *     description: OK. Usuario actualizado exitosamente.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Usuario actualizado exitosamente"
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
   *     description: Bad Request. El ID proporcionado no es un número válido.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    401:
   *     description: Unauthorized. El token de autenticación no es válido o no se proporcionó.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden. El usuario no tiene permisos para actualizar otros usuarios.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    404:
   *     description: Not Found. No se encontró ningún usuario con el ID proporcionado.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El usuario no existe"
   *    422:
   *     description: Unprocessable Entity. Los datos proporcionados no son válidos.
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
   *     description: Internal Server Error. Ocurrió un error inesperado en el servidor.
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *  get:
   *   summary: Obtener un usuario por su ID
   *   description: Retorna la información de un usuario específico a partir de su ID.
   *   operationId: getUserById
   *   tags: [Usuarios]
   *   security:
   *     - BearerAuth: []
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: integer
   *      description: ID numérico del usuario a obtener.
   *      required: true
   *   responses:
   *    200:
   *     description: OK. Usuario obtenido exitosamente.
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
   *     description: Bad Request. El ID proporcionado no es un número válido.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    401:
   *     description: Unauthorized. El token de autenticación no es válido o no se proporcionó.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorValidationToken'
   *    403:
   *     description: Forbidden. El usuario no tiene permisos para acceder a este recurso.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/ErrorSecuritySchema'
   *    404:
   *     description: Not Found. No se encontró ningún usuario con el ID proporcionado.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El usuario no existe"
   *    500:
   *     description: Internal Server Error. Ocurrió un error inesperado en el servidor.
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
