import { Router } from "express";

import { verifyToken } from "../middlewares/authJWT";
import {
  createClient,
  getClientById,
  getClients,
  updateClient,
} from "@/controllers/ClientController";
import { validateIdMiddleware } from "../middlewares/validations/validateIdMiddleware";
import { validateClient } from "../middlewares/validations/clientRequest";

/**
 * @swagger
 * components:
 *   schemas:
 *    CreateClient:
 *     type: object
 *     required:
 *      - ciRif
 *      - emailContacto
 *      - emailEmpresa
 *      - empresaTelefono
 *      - nombreContacto
 *      - direccionFiscal
 *      - nombreEmpresa
 *     properties:
 *      ciRif:
 *        type: string
 *        description: Cédula o Rif del Cliente
 *      emailContacto:
 *        type: string
 *        description: Correo electrónico del Contacto
 *      emailEmpresa:
 *        type: string
 *        description: Correo electrónico de la empresa
 *      empresaTelefono:
 *        type: string
 *        description: Número telefónico de la empresa
 *      nombreContacto:
 *        type: string
 *        description: Nombre del contacto
 *      direccionFiscal:
 *        type: string
 *        description: Dirección fiscal de la empresa
 *      nombreEmpresa:
 *        type: string
 *        description: Nombre de la empresa
 *     example:
 *      ciRif: "J123456789"
 *      emailContacto: "inme.luis@gmail.com"
 *      emailEmpresa: "inme@gmail.com"
 *      empresaTelefono: "04141234567"
 *      nombreContacto: "Luis Mogollon"
 *      direccionFiscal: "Calle A, Edificio Inme, Piso 1, Oficina 2"
 *      nombreEmpresa: "Pepito C.A."
 */

export const clientRouters = () => {
  const routerRoot = Router();

  /**
   * @swagger
   * /api/v1.0/client:
   *  post:
   *   summary: Crear un nuevo cliente
   *   tags: [Clientes]
   *   security:
   *     - BearerAuth: []
   *   requestBody:
   *     required: true
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           $ref: '#/components/schemas/CreateClient'
   *   responses:
   *    201:
   *     description: Cliente creado exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Cliente creado exitosamente!"
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
   *        }
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
   *        message: 'Ya existe un cliente con el mismo CI/RIF'
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
   *          message: [ "El nombre del contacto debe ser una cadena", "El nombre del contacto debe tener al menos 3 caracteres", "El nombre del contacto no debe exceder los 70 caracteres", 'El nombre de la empresa debe ser una cadena', 'El nombre de la empresa debe tener al menos 3 caracteres','El nombre de la empresa no debe exceder los 70 caracteres', 'El teléfono de la empresa debe ser una cadena', 'El teléfono de la empresa debe tener al menos 7 caracteres', 'El teléfono de la empresa no debe exceder los 22 caracteres', 'El email de la empresa no es válido', 'El email de la empresa no debe exceder los 150 caracteres', 'El email del contacto no es válido', 'El email del contacto no debe exceder los 150 caracteres', 'El CI/RIF debe ser una cadena', 'El CI/RIF no es válido', 'El CI/RIF debe tener al menos 6 caracteres', 'El CI/RIF no debe exceder los 150 caracteres',  'La dirección fiscal debe ser una cadena', 'La dirección fiscal debe tener al menos 10 caracteres', 'La dirección fiscal no debe exceder los 350 caracteres']
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
   *   summary: Obtener todos los clientes
   *   security:
   *    - BearerAuth: []
   *   tags: [Clientes]
   *   parameters:
   *    - in: query
   *      name: limit
   *      schema:
   *       type: number
   *      description: Número máximo de clientes a retornar (por defecto 10)
   *    - in: query
   *      name: offset
   *      schema:
   *       type: number
   *      description: Número de clientes a omitir (por defecto 0)
   *    - in: query
   *      name: nombreEmpresa
   *      schema:
   *       type: string
   *      description: Filtrar clientes por nombre de empresa
   *   responses:
   *    200:
   *     description: Lista de clientes obtenida exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Clientes obtenidos exitosamente"
   *        data: {
   *         clients: [{
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
   *         }],
   *         total: 1 }
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
    .get(verifyToken, getClients)
    .post([verifyToken, validateClient], createClient);

  /**
   * @swagger
   * /api/v1.0/client/{id}:
   *  get:
   *   summary: Obtener un cliente por ID
   *   security:
   *    - BearerAuth: []
   *   tags: [Clientes]
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del cliente
   *      required: true
   *   responses:
   *    200:
   *     description: Cliente obtenido exitosamente
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: true
   *        message: "Cliente obtenido exitosamente"
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
   *        message: "Cliente no encontrado"
   *    422:
   *     description: Unprocessable Entity
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       example:
   *        status: false
   *        data: null
   *        message: "El id proporcionado no es válido"
   *    500:
   *     content:
   *      text/plain; charset=utf-8:
   *       schema:
   *        $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *  put:
   *   summary: Actualizar un cliente por ID
   *   security:
   *    - BearerAuth: []
   *   tags: [Clientes]
   *   parameters:
   *    - in: path
   *      name: id
   *      schema:
   *       type: number
   *      description: ID del cliente
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
   *     description: Cliente actualizado exitosamente
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
   *        message: "Cliente actualizado exitosamente"
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
   *        message: "Cliente no encontrado"
   *    422:
   *     description: Unprocessable Entity
   *     content:
   *      application/json:
   *       schema:
   *        $ref: '#/components/schemas/GenericResponseSchema'
   *       examples:
   *        invalidId:
   *         summary: ID inválido
   *         value:
   *          status: false
   *          data: null
   *          message: "El id proporcionado no es válido"
   *        invalidBody:
   *         summary: Cuerpo de solicitud inválido
   *         value:
   *          status: false
   *          data: null
   *          message: [ "El nombre del contacto debe ser una cadena", "El nombre del contacto debe tener al menos 3 caracteres", "El nombre del contacto no debe exceder los 70 caracteres", 'El nombre de la empresa debe ser una cadena', 'El nombre de la empresa debe tener al menos 3 caracteres','El nombre de la empresa no debe exceder los 70 caracteres', 'El teléfono de la empresa debe ser una cadena', 'El teléfono de la empresa debe tener al menos 7 caracteres', 'El teléfono de la empresa no debe exceder los 22 caracteres', 'El email de la empresa no es válido', 'El email de la empresa no debe exceder los 150 caracteres', 'El email del contacto no es válido', 'El email del contacto no debe exceder los 150 caracteres', 'El CI/RIF debe ser una cadena', 'El CI/RIF no es válido', 'El CI/RIF debe tener al menos 6 caracteres', 'El CI/RIF no debe exceder los 150 caracteres',  'La dirección fiscal debe ser una cadena', 'La dirección fiscal debe tener al menos 10 caracteres', 'La dirección fiscal no debe exceder los 350 caracteres']
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
    .get([verifyToken, validateIdMiddleware], getClientById)
    .put([verifyToken, validateIdMiddleware, validateClient], updateClient);

  return routerRoot;
};
