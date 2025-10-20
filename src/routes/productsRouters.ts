import { Router } from "express";

import {
  ChargeProductsController,
  CreateProductsController,
  DischargeProductsController,
  GetProductByIdController,
  GetProductsController,
  UpdateProductController,
} from "@/controllers/ProductsController";
import { isUser, verifyToken } from "@/middlewares/authJWT";
import { validateIdMiddleware } from "@/middlewares/validations/generalValidationMiddlewares";
import {
  validateMaterialsExistence,
  validateProdExistenceChangeMiddleware,
  validateProductFields,
  validateProvidersExistence,
} from "@/middlewares/validations/validateProductsMiddleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProduct:
 *       type: object
 *       required:
 *         - codigo
 *         - nombre
 *         - measureUnit
 *         - planos
 *         - materialsList
 *         - providersList
 *       properties:
 *         codigo:
 *           type: string
 *           description: Código único del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         planos:
 *           type: string
 *           description: URL hacia los planos del producto
 *         measureUnit:
 *           type: string
 *           description: Unidad de medida del producto (ej. kg, unidad)
 *         materialsList:
 *           type: array
 *           description: Lista de materiales (productos componentes) con sus cantidades
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 description: ID del producto componente
 *               quantity:
 *                 type: number
 *                 description: Cantidad requerida del componente
 *         providersList:
 *           type: array
 *           description: Lista de proveedores asociados al producto
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 description: ID del proveedor
 *       example:
 *         codigo: "PROD-001"
 *         nombre: "Tornillo 1/4"
 *         planos: "https://example.com/planos/tornillo-1-4.pdf"
 *         measureUnit: "unidad"
 *         materialsList:
 *           - { id: 2, quantity: 3 }
 *           - { id: 5, quantity: 1 }
 *         providersList:
 *           - { id: 1 }
 *           - { id: 3 }
 */

export const productsRouters = () => {
  const router = Router();

  /**
   * @swagger
   * /api/v1.0/products:
   *   get:
   *     summary: Obtener todos los productos
   *     security:
   *       - BearerAuth: []
   *     tags: [Productos]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *         description: Número máximo de productos a retornar (por defecto 10)
   *       - in: query
   *         name: offset
   *         schema:
   *           type: number
   *         description: Número de productos a omitir (por defecto 0)
   *       - in: query
   *         name: codigo
   *         schema:
   *           type: string
   *         description: Filtrar por código de producto (coincidencia parcial)
   *       - in: query
   *         name: nombre
   *         schema:
   *           type: string
   *         description: Filtrar por nombre de producto (coincidencia parcial)
   *       - in: query
   *         name: productType
   *         schema:
   *           type: string
   *           enum: [insumos, sencillos, compuestos]
   *         description: Tipo de producto
   *     responses:
   *       200:
   *         description: Lista de productos obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Productos obtenidos exitosamente"
   *               data:
   *                 products:
   *                   - id: 1
   *                     codigo: "PROD-001"
   *                     nombre: "Tornillo 1/4"
   *                     existencia: 0
   *                     measureUnit: "unidad"
   *                     planos: "https://example.com/planos/tornillo-1-4.pdf"
   *                     productType: "sencillos"
   *                     materialsList:
   *                       - id: 1
   *                         quantity: 3
   *                         idProdComponente:
   *                           id: 2
   *                           nombre: "Acero inoxidable"
   *                           codigo: "MAT-001"
   *                           measureUnit: "kg"
   *                     providers:
   *                       - id: 1
   *                         enterpriseName: "Pepito C.A."
   *                 total: 1
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorValidationToken'
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorSecuritySchema'
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *   post:
   *     summary: Crear un nuevo producto
   *     tags: [Productos]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             $ref: '#/components/schemas/CreateProduct'
   *     responses:
   *       200:
   *         description: Producto creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Producto creado exitosamente"
   *               data:
   *                 id: 1
   *                 codigo: "PROD-001"
   *                 nombre: "Tornillo 1/4"
   *                 existencia: 0
   *                 measureUnit: "unidad"
   *                 planos: "https://example.com/planos/tornillo-1-4.pdf"
   *                 productType: "sencillos"
   *                 materialsList:
   *                   - id: 1
   *                     quantity: 3
   *                     idProdComponente:
   *                       id: 2
   *                     idProdCompuesto:
   *                       id: 1
   *                 providers:
   *                   - id: 1
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *                 deletedAt: null
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               providersNotExist:
   *                 summary: Algunos proveedores no existen
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "Algunos proveedores no existen"
   *               materialsNotExist:
   *                 summary: Algunos materiales no existen
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "Algunos materiales no existen"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorValidationToken'
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorSecuritySchema'
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidBody:
   *                 summary: Cuerpo de solicitud inválido
   *                 value:
   *                   status: false
   *                   data: null
   *                   message:
   *                     - "Debe ser una url válida"
   *                     - "La URL debe tener un máximo de 500 caracteres"
   *                     - "La cantidad debe ser mayor a 0"
   *               emptyBody:
   *                 summary: El cuerpo de la solicitud está vacío
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "No se proporcionaron datos en el cuerpo de solicitud"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  router
    .route("/")
    .get(verifyToken, GetProductsController)
    .post(
      [
        verifyToken,
        isUser,

        validateProductFields,
        validateMaterialsExistence,
        validateProvidersExistence,
      ],
      CreateProductsController,
    );

  /**
   * @swagger
   * /api/v1.0/products/charge/{id}:
   *   post:
   *     summary: Cargar/aumentar la existencia de un producto
   *     tags: [Productos]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID del producto
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *               - description
   *               - action
   *             properties:
   *               quantity:
   *                 type: number
   *                 description: Cantidad a aumentar en el inventario
   *               description:
   *                 type: string
   *                 maxLength: 300
   *                 description: Descripción del movimiento de inventario
   *               action:
   *                 type: string
   *                 enum: [INGRESO, VARIOS]
   *                 description: Tipo de acción para el historial (solo INGRESO o VARIOS)
   *               provider:
   *                 type: object
   *                 description: Proveedor asociado al ingreso (opcional)
   *                 properties:
   *                   id:
   *                     type: number
   *                     description: ID del proveedor
   *             example:
   *               quantity: 50
   *               description: "Ingreso de materiales del proveedor ABC"
   *               action: "INGRESO"
   *               provider:
   *                 id: 1
   *     responses:
   *       200:
   *         description: Producto cargado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Producto cargado exitosamente"
   *               data:
   *                 id: 1
   *                 codigo: "PROD-001"
   *                 nombre: "Tornillo 1/4"
   *                 existencia: 50
   *                 measureUnit: "unidad"
   *                 planos: "https://example.com/planos/tornillo-1-4.pdf"
   *                 productType: "sencillos"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *                 deletedAt: null
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               data: null
   *               message: "El id proporcionado no es válido"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorValidationToken'
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorSecuritySchema'
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               data: null
   *               message: "Producto no encontrado"
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidQuantity:
   *                 summary: Cantidad inválida
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "La cantidad debe ser mayor a 0"
   *               invalidAction:
   *                 summary: Acción inválida para cargar
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "Los valores para cargar deben ser INGRESO O VARIOS"
   *               invalidDescription:
   *                 summary: Descripción muy larga
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "La descripción debe tener un máximo de 300 caracteres"
   *               providerNotExist:
   *                 summary: Proveedor no existe
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "El proveedor seleccionado no existe"
   *               emptyBody:
   *                 summary: El cuerpo de la solicitud está vacío
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "No se proporcionaron datos en el cuerpo de solicitud"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  router.post(
    "/charge/:id",
    [
      verifyToken,
      isUser,
      validateIdMiddleware,
      validateProdExistenceChangeMiddleware,
    ],
    ChargeProductsController,
  );
  /**
   * @swagger
   * /api/v1.0/products/discharge/{id}:
   *   post:
   *     summary: Descargar/disminuir la existencia de un producto
   *     tags: [Productos]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID del producto
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *               - description
   *               - action
   *             properties:
   *               quantity:
   *                 type: number
   *                 description: Cantidad a disminuir del inventario
   *               description:
   *                 type: string
   *                 maxLength: 300
   *                 description: Descripción del movimiento de inventario
   *               action:
   *                 type: string
   *                 enum: [EGRESO, VENTA, VARIOS]
   *                 description: Tipo de acción para el historial (EGRESO, VENTA o VARIOS)
   *               client:
   *                 type: object
   *                 description: Cliente asociado a la venta/egreso (opcional)
   *                 properties:
   *                   id:
   *                     type: number
   *                     description: ID del cliente
   *             example:
   *               quantity: 10
   *               description: "Venta a cliente XYZ"
   *               action: "VENTA"
   *               client:
   *                 id: 5
   *     responses:
   *       200:
   *         description: Producto descargado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Producto descargado exitosamente"
   *               data:
   *                 id: 1
   *                 codigo: "PROD-001"
   *                 nombre: "Tornillo 1/4"
   *                 existencia: 40
   *                 measureUnit: "unidad"
   *                 planos: "https://example.com/planos/tornillo-1-4.pdf"
   *                 productType: "sencillos"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *                 deletedAt: null
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidId:
   *                 summary: ID inválido
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "El id proporcionado no es válido"
   *               insufficientStock:
   *                 summary: Stock insuficiente
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "No hay suficiente stock para descargar"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorValidationToken'
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorSecuritySchema'
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               data: null
   *               message: "Producto no encontrado"
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidQuantity:
   *                 summary: Cantidad inválida
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "La cantidad debe ser mayor a 0"
   *               invalidAction:
   *                 summary: Acción inválida para descargar
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "Los valores para descargar deben ser VENTA, EGRESO O VARIOS"
   *               invalidDescription:
   *                 summary: Descripción muy larga
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "La descripción debe tener un máximo de 300 caracteres"
   *               clientNotExist:
   *                 summary: Cliente no existe
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "El cliente seleccionado no existe"
   *               emptyBody:
   *                 summary: El cuerpo de la solicitud está vacío
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "No se proporcionaron datos en el cuerpo de solicitud"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  router.post(
    "/discharge/:id",
    [
      verifyToken,
      isUser,
      validateIdMiddleware,
      validateProdExistenceChangeMiddleware,
    ],
    DischargeProductsController,
  );

  /**
   * @swagger
   * /api/v1.0/products/{id}:
   *   get:
   *     summary: Obtener un producto por ID
   *     security:
   *       - BearerAuth: []
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID del producto
   *         required: true
   *     responses:
   *       200:
   *         description: Producto obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Producto obtenido exitosamente"
   *               data:
   *                 id: 1
   *                 codigo: "PROD-001"
   *                 nombre: "Tornillo 1/4"
   *                 existencia: 0
   *                 measureUnit: "unidad"
   *                 planos: "https://example.com/planos/tornillo-1-4.pdf"
   *                 productType: "sencillos"
   *                 materialsList: []
   *                 providers: []
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *                 deletedAt: null
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorValidationToken'
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorSecuritySchema'
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               data: null
   *               message: "Producto no encontrado"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *   put:
   *     summary: Actualizar un producto por ID
   *     security:
   *       - BearerAuth: []
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID del producto
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             $ref: '#/components/schemas/CreateProduct'
   *     responses:
   *       200:
   *         description: Producto actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Producto actualizado exitosamente"
   *               data:
   *                 id: 1
   *                 codigo: "PROD-001"
   *                 nombre: "Tornillo 1/4 Actualizado"
   *                 existencia: 0
   *                 measureUnit: "unidad"
   *                 planos: "https://example.com/planos/tornillo-1-4-v2.pdf"
   *                 productType: "sencillos"
   *                 materialsList:
   *                   - id: 1
   *                     quantity: 5
   *                     idProdComponente:
   *                       id: 3
   *                     idProdCompuesto:
   *                       id: 1
   *                 providers:
   *                   - id: 1
   *                   - id: 2
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-02T00:00:00.000Z"
   *                 deletedAt: null
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidId:
   *                 summary: ID inválido
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "El id proporcionado no es válido"
   *               providersNotExist:
   *                 summary: Algunos proveedores no existen
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "Algunos proveedores no existen"
   *               materialsNotExist:
   *                 summary: Algunos materiales no existen
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "Algunos materiales no existen"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorValidationToken'
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorSecuritySchema'
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               data: null
   *               message: "Producto no encontrado"
   *       409:
   *         description: Conflict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               data: null
   *               message: "Ya existe un producto con el mismo codigo"
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidBody:
   *                 summary: Cuerpo de solicitud inválido
   *                 value:
   *                   status: false
   *                   data: null
   *                   message:
   *                     - "Debe ser una url válida"
   *                     - "La URL debe tener un máximo de 500 caracteres"
   *                     - "La cantidad debe ser mayor a 0"
   *               emptyBody:
   *                 summary: El cuerpo de la solicitud está vacío
   *                 value:
   *                   status: false
   *                   data: null
   *                   message: "No se proporcionaron datos para actualizar"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  router
    .route("/:id")
    .get(verifyToken, GetProductByIdController)
    .put(
      [
        verifyToken,
        isUser,
        validateIdMiddleware,
        validateProductFields,
        validateMaterialsExistence,
        validateProvidersExistence,
      ],
      UpdateProductController,
    );
  return router;
};
