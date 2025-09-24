import { Router } from "express";

import {
  createProvidersController,
  getProviderByIdController,
  getProvidersController,
  updateProviderController,
} from "@/controllers/ProvidersController";
import { verifyToken } from "@/middlewares/authJWT";
import { providersRequestMiddleware } from "@/middlewares/validations/providersRequestMiddleware";
import { validateIdMiddleware } from "@/middlewares/validations/validateIdMiddleware";

/**
 * @swagger
 * components:
 *   schemas:
 *    CreateProvider:
 *     type: object
 *     required:
 *      - address
 *      - ciRif
 *      - description
 *      - email
 *      - enterpriseName
 *      - instagram
 *      - personContact
 *      - enterprisePhone
 *      - taxAddress
 *      - website
 *     properties:
 *      ciRif:
 *        type: string
 *        description: Cédula o Rif de la empresa
 *      email:
 *        type: string
 *        description: Correo electrónico de la empresa
 *      description:
 *        type: string
 *        description: Descripción de la empresa
 *      address:
 *        type: string
 *        description: Dirección de la empresa
 *      enterpriseName:
 *        type: string
 *        description: Nombre de la empresa
 *      enterprisePhone:
 *        type: string
 *        description: Número telefónico de la empresa
 *      instagram:
 *        type: string
 *        description: Instagram de la empresa
 *      personContact:
 *        type: string
 *        description: Nombre de la persona de contacto en la empresa
 *      taxAddress:
 *        type: string
 *        description: Dirección fiscal de la empresa
 *      website:
 *        type: string
 *        description: Sitio web de la empresa
 *     example:
 *      ciRif: "J123456789"
 *      email: "inme.luis@gmail.com"
 *      description: "Descripción de la empresa"
 *      enterprisePhone: "04141234567"
 *      personContact: "Luis Mogollon"
 *      address: "Calle A, Edificio Inme, Piso 1, Oficina 2"
 *      enterpriseName: "Pepito C.A."
 *      instagram: "https://www.instagram.com/inme"
 *      taxAddress: "Calle A, Edificio Inme, Piso 1, Oficina 2"
 *      website: "https://www.inme.com"
 */

export const providersRouters = () => {
  const routerRoot = Router();
  /**
   * @swagger
   * /api/v1.0/providers:
   *  post:
   *   summary: Crear un nuevo proveedor
   *   tags: [Proveedores]
   *   security:
   *     - BearerAuth: []
   *   requestBody:
   *     required: true
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           $ref: '#/components/schemas/CreateProvider'
   *   responses:
   *    201:
   *     description: Proveedor creado exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Proveedor creado exitosamente!"
   *        data: {
   *         id: 1,
   *         ciRif: "J123456789",
   *         email: "inme.luis@gmail.com",
   *         description: "Descripción de la empresa",
   *         enterprisePhone: "04141234567",
   *         personContact: "Luis Mogollon",
   *         address: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         enterpriseName: "Pepito C.A.",
   *         instagram: "https://www.instagram.com/inme",
   *         taxAddress: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         website: "https://www.inme.com",
   *         products: [],
   *         createdAt: "2024-01-01T00:00:00.000Z",
   *         updatedAt: "2024-01-01T00:00:00.000Z",
   *         deletedAt: null
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
   *    409:
   *     description: Conflict
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: 'Ya existe un proveedor con el mismo CI/RIF'
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
   *          message: [ "El nombre de la empresa debe ser una cadena", "El nombre de la empresa debe tener al menos 3 caracteres", "El nombre de la empresa no debe exceder los 100 caracteres", "El nombre del contacto debe ser una cadena", "El nombre del contacto debe tener al menos 3 caracteres", "El nombre del contacto no debe exceder los 100 caracteres", "El teléfono de la empresa debe ser una cadena",  "El teléfono de la empresa debe tener al menos 7 caracteres", "El teléfono de la empresa no debe exceder los 22 caracteres", "La descripción de la empresa debe ser una cadena", "La descripción de la empresa debe tener al menos 20 caracteres", "La descripción de la empresa no debe exceder los 400 caracteres", "El email de la empresa no es válido", "El email de la empresa no debe exceder los 150 caracteres", "El CI/RIF debe ser una cadena", "El CI/RIF debe tener al menos 6 caracteres", "El CI/RIF no debe exceder los 11 caracteres", "El CI/RIF no es válido",  "La dirección fiscal debe ser una cadena", "La dirección fiscal debe tener al menos 10 caracteres", "La dirección fiscal no debe exceder los 200 caracteres", "La dirección debe ser una cadena", "La dirección debe tener al menos 10 caracteres", "La dirección no debe exceder los 200 caracteres", "El website debe ser una URL válida", "La URL no debe exceder los 300 caracteres", "La cuenta de Instagram debe ser una URL válida", "La URL no debe exceder los 200 caracteres"]
   *        emptyBody:
   *         summary: El cuerpo de la solicitud está vacío
   *         value:
   *          status: false
   *          data: null
   *          message: "No se proporcionaron datos en el cuerpo de solicitud"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *  get:
   *   summary: Obtener todos los proveedores
   *   security:
   *    - BearerAuth: []
   *   tags: [Proveedores]
   *   parameters:
   *    - in: query
   *      name: limit
   *      schema:
   *       type: number
   *      description: Número máximo de proveedores a retornar (por defecto 10)
   *    - in: query
   *      name: offset
   *      schema:
   *       type: number
   *      description: Número de proveedores a omitir (por defecto 0)
   *    - in: query
   *      name: enterpriseName
   *      schema:
   *       type: string
   *      description: Filtrar proveedores por nombre de empresa
   *   responses:
   *    200:
   *     description: Lista de proveedores obtenida exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Proveedores obtenidos exitosamente"
   *        data: {
   *         providers: [{
   *         id: 1,
   *         ciRif: "J123456789",
   *         email: "inme.luis@gmail.com",
   *         description: "Descripción de la empresa",
   *         enterprisePhone: "04141234567",
   *         personContact: "Luis Mogollon",
   *         address: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         enterpriseName: "Pepito C.A.",
   *         instagram: "https://www.instagram.com/inme",
   *         taxAddress: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         website: "https://www.inme.com",
   *         products: [],
   *         createdAt: "2024-01-01T00:00:00.000Z",
   *         updatedAt: "2024-01-01T00:00:00.000Z",
   *         deletedAt: null
   *         }],
   *         total: 1 }
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
  routerRoot
    .route("/")
    .get(verifyToken, getProvidersController)
    .post([verifyToken, providersRequestMiddleware], createProvidersController);

  /**
   * @swagger
   * /api/v1.0/providers/{id}:
   *  get:
   *   summary: Obtener un proveedor por ID
   *   security:
   *    - BearerAuth: []
   *   tags: [Proveedores]
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del proveedor
   *      required: true
   *   responses:
   *    200:
   *     description: Proveedor obtenido exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Proveedor obtenido exitosamente"
   *        data: {
   *         id: 1,
   *         ciRif: "J123456789",
   *         email: "inme.luis@gmail.com",
   *         description: "Descripción de la empresa",
   *         enterprisePhone: "04141234567",
   *         personContact: "Luis Mogollon",
   *         address: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         enterpriseName: "Pepito C.A.",
   *         instagram: "https://www.instagram.com/inme",
   *         taxAddress: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         website: "https://www.inme.com",
   *         products: [],
   *         createdAt: "2024-01-01T00:00:00.000Z",
   *         updatedAt: "2024-01-01T00:00:00.000Z",
   *         deletedAt: null
   *         }
   *    400:
   *     description: Unprocessable Entity
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
   *        message: "Proveedor no encontrado"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *  put:
   *   summary: Actualizar un proveedor por ID
   *   security:
   *    - BearerAuth: []
   *   tags: [Proveedores]
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del proveedor
   *      required: true
   *   requestBody:
   *     required: true
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           $ref: '#/components/schemas/CreateClient'
   *   responses:
   *    200:
   *     description: Proveedor actualizado exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        data: {
   *         id: 1,
   *         ciRif: "J123456789",
   *         emailContacto: "inme.luis@gmail.com",
   *         emailEmpresa: "inme@gmail.com",
   *         empresaTelefono: "04141234567",
   *         nombreContacto: "Luis Mogollon",
   *         direccionFiscal: "Calle A, Edificio Inme, Piso 1, Oficina 2",
   *         nombreEmpresa: "Pepito C.A.",
   *         createdAt: "2024-01-01T00:00:00.000Z",
   *         updatedAt: "2024-01-01T00:00:00.000Z",
   *         deletedAt: null
   *         }
   *        message: "Proveedor actualizado exitosamente"
   *    400:
   *     description: Unprocessable Entity
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
   *        message: "Proveedor no encontrado"
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
   *          message: [ "El nombre de la empresa debe ser una cadena", "El nombre de la empresa debe tener al menos 3 caracteres", "El nombre de la empresa no debe exceder los 100 caracteres", "El nombre del contacto debe ser una cadena", "El nombre del contacto debe tener al menos 3 caracteres", "El nombre del contacto no debe exceder los 100 caracteres", "El teléfono de la empresa debe ser una cadena",  "El teléfono de la empresa debe tener al menos 7 caracteres", "El teléfono de la empresa no debe exceder los 22 caracteres", "La descripción de la empresa debe ser una cadena", "La descripción de la empresa debe tener al menos 20 caracteres", "La descripción de la empresa no debe exceder los 400 caracteres", "El email de la empresa no es válido", "El email de la empresa no debe exceder los 150 caracteres", "El CI/RIF debe ser una cadena", "El CI/RIF debe tener al menos 6 caracteres", "El CI/RIF no debe exceder los 11 caracteres", "El CI/RIF no es válido",  "La dirección fiscal debe ser una cadena", "La dirección fiscal debe tener al menos 10 caracteres", "La dirección fiscal no debe exceder los 200 caracteres", "La dirección debe ser una cadena", "La dirección debe tener al menos 10 caracteres", "La dirección no debe exceder los 200 caracteres", "El website debe ser una URL válida", "La URL no debe exceder los 300 caracteres", "La cuenta de Instagram debe ser una URL válida", "La URL no debe exceder los 200 caracteres"]
   *        emptyBody:
   *         summary: El cuerpo de la solicitud está vacío
   *         value:
   *          status: false
   *          data: null
   *          message: "No se proporcionaron datos en el cuerpo de solicitud"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */

  routerRoot
    .route("/:id")
    .get([verifyToken, validateIdMiddleware], getProviderByIdController)
    .put(
      [verifyToken, validateIdMiddleware, providersRequestMiddleware],
      updateProviderController,
    );

  return routerRoot;
};
