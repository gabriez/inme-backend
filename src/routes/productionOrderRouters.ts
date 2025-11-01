import { Router } from "express";

import {
  ChangeProductionOrderStatusController,
  CreateProductionOrderController,
  GetProductionOrderReport,
  GetProductionOrdersController,
  UpdateProductionOrderController,
} from "@/controllers/ProductionOrderController";
import { GetProductByIdController } from "@/controllers/ProductsController";
import { isUser, verifyToken } from "@/middlewares/authJWT";
import { validateIdMiddleware } from "@/middlewares/validations/generalValidationMiddlewares";
import {
  validateOrderState,
  validateProductionOrderFieldsMiddleware,
} from "@/middlewares/validations/validateProductionOrdersMiddleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProductionOrder:
 *       type: object
 *       required:
 *         - cantidadProductoFabricado
 *         - endDate
 *         - responsables
 *         - product
 *       properties:
 *         cantidadProductoFabricado:
 *           type: number
 *           description: Cantidad de productos a fabricar
 *           minimum: 1
 *         endDate:
 *           type: string
 *           format: date
 *           description: Fecha estimada de finalización (debe ser posterior a hoy)
 *         responsables:
 *           type: string
 *           minLength: 10
 *           maxLength: 400
 *           description: Nombres de los responsables de la orden
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: ID del producto a fabricar
 *       example:
 *         cantidadProductoFabricado: 100
 *         endDate: "2025-12-31"
 *         responsables: "Juan Pérez, María González"
 *         product:
 *           id: 5
 */

export const productionOrderRoutes = (): Router => {
  const routerRoot = Router();

  /**
   * @swagger
   * /api/v1.0/production-orders:
   *   get:
   *     summary: Obtener todas las órdenes de producción
   *     security:
   *       - BearerAuth: []
   *     tags: [Órdenes de Producción]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *         description: Número máximo de órdenes a retornar (por defecto 10)
   *       - in: query
   *         name: offset
   *         schema:
   *           type: number
   *         description: Número de órdenes a omitir (por defecto 0)
   *       - in: query
   *         name: product
   *         schema:
   *           type: string
   *         description: Filtrar por nombre de producto (coincidencia parcial)
   *       - in: query
   *         name: orderState
   *         schema:
   *           type: string
   *           enum: [EnProceso, Ejecutada, Cancelada, PorIniciar]
   *         description: Filtrar por estado de la orden
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar por fecha de inicio
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar por fecha estimada de finalización
   *       - in: query
   *         name: realEndDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar por fecha real de finalización
   *     responses:
   *       200:
   *         description: Órdenes de producción obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Ordenes de producción obtenidas exitosamente"
   *               data:
   *                 productionOrders:
   *                   - id: 1
   *                     product:
   *                       id: 5
   *                       nombre: "Tornillo especial"
   *                     cantidadProductoFabricado: 100
   *                     orderState: "Por iniciar"
   *                     startDate: null
   *                     endDate: "2025-12-31"
   *                     realEndDate: null
   *                     responsables: "Juan Pérez, María González"
   *                 total: 1
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               message: "orderState inválido. Los valores válidos son: EnProceso, Ejecutada, Cancelada, PorIniciar"
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
   *     summary: Crear una nueva orden de producción
   *     tags: [Órdenes de Producción]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateProductionOrder'
   *     responses:
   *       201:
   *         description: Orden de producción creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Orden de producción creada exitosamente"
   *               data:
   *                 id: 1
   *                 cantidadProductoFabricado: 100
   *                 orderState: "Por iniciar"
   *                 endDate: "2025-12-31"
   *                 responsables: "Juan Pérez, María González"
   *                 product:
   *                   id: 5
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               insufficientMaterials:
   *                 summary: Materiales insuficientes
   *                 value:
   *                   status: false
   *                   message: "Todos los materiales existentes ya han sido ocupados. Carga más materiales o cancela una orden en cola."
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               productNotFound:
   *                 summary: Producto no encontrado
   *                 value:
   *                   status: false
   *                   message: "Producto no encontrado"
   *               materialsNotFound:
   *                 summary: Materiales no encontrados
   *                 value:
   *                   status: false
   *                   message: "Algunos materiales para la producción no existen en la base de datos"
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidFields:
   *                 summary: Campos inválidos
   *                 value:
   *                   status: false
   *                   message:
   *                     - "La cantidad de producto fabricado debe ser mayor a 0"
   *                     - "La fecha de finalización debe ser posterior a hoy"
   *               emptyBody:
   *                 summary: Cuerpo vacío
   *                 value:
   *                   status: false
   *                   message: "No se proporcionaron datos en el cuerpo de solicitud"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot
    .route("/")
    .get([verifyToken], GetProductionOrdersController)
    .post(
      [verifyToken, isUser, validateProductionOrderFieldsMiddleware],
      CreateProductionOrderController,
    );

  /**
   * @swagger
   * /api/v1.0/production-orders/update-state/{id}:
   *   patch:
   *     summary: Cambiar el estado de una orden de producción
   *     tags: [Órdenes de Producción]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID de la orden de producción
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderState
   *             properties:
   *               orderState:
   *                 type: string
   *                 enum: [EnProceso, Ejecutada, Cancelada]
   *                 description: Nuevo estado de la orden (no se puede cambiar a PorIniciar)
   *             example:
   *               orderState: "EnProceso"
   *     responses:
   *       200:
   *         description: Orden de producción actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Orden de producción actualizada exitosamente"
   *               data:
   *                 id: 1
   *                 orderState: "En proceso"
   *                 startDate: "2025-10-05"
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidTransition:
   *                 summary: Transición de estado inválida
   *                 value:
   *                   status: false
   *                   message: "No se puede modificar el estado de la orden a En Proceso si no está por iniciar"
   *               stockError:
   *                 summary: Error de inventario
   *                 value:
   *                   status: false
   *                   message: "No se puede reducir la existencia del producto MAT-001 a menos de cero. Hay un error en el historial"
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               message: "Orden de producción no encontrada"
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidState:
   *                 summary: Estado inválido
   *                 value:
   *                   status: false
   *                   message: "OrderState inválido. Los valores válidos son: EnProceso, Ejecutada, Cancelada, PorIniciar"
   *               emptyBody:
   *                 summary: Cuerpo vacío
   *                 value:
   *                   status: false
   *                   message: "No se proporcionaron datos para modificar el estado de la orden"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot.patch(
    "/update-state/:id",
    [verifyToken, isUser, validateIdMiddleware, validateOrderState],
    ChangeProductionOrderStatusController,
  );

  /**
   * @swagger
   * /api/v1.0/production-orders/report/{id}:
   *   get:
   *     summary: Generar reporte PDF de una orden de producción
   *     security:
   *       - BearerAuth: []
   *     tags: [Órdenes de Producción]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID de la orden de producción
   *         required: true
   *     responses:
   *       200:
   *         description: PDF generado exitosamente
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               message: "Orden de producción no encontrada"
   *       500:
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   */
  routerRoot.get(
    "/report/:id",
    [verifyToken, validateIdMiddleware],
    GetProductionOrderReport,
  );

  /**
   * @swagger
   * /api/v1.0/production-orders/{id}:
   *   get:
   *     summary: Obtener una orden de producción por ID
   *     security:
   *       - BearerAuth: []
   *     tags: [Órdenes de Producción]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID de la orden de producción
   *         required: true
   *     responses:
   *       200:
   *         description: Orden de producción obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: false
   *               message: "Producto no encontrado"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   *   put:
   *     summary: Actualizar una orden de producción (solo si está en estado Por Iniciar)
   *     security:
   *       - BearerAuth: []
   *     tags: [Órdenes de Producción]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: number
   *         description: ID de la orden de producción
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateProductionOrder'
   *     responses:
   *       200:
   *         description: Orden de producción actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Orden de producción actualizada exitosamente"
   *               data:
   *                 id: 1
   *                 cantidadProductoFabricado: 150
   *                 orderState: "Por iniciar"
   *                 endDate: "2025-12-31"
   *                 responsables: "Juan Pérez, María González, Carlos López"
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               cannotUpdate:
   *                 summary: No se puede actualizar
   *                 value:
   *                   status: false
   *                   message: "No se puede actualizar una orden de producción ya inicializada, finalizada o cancelada"
   *               insufficientMaterials:
   *                 summary: Materiales insuficientes para nueva cantidad
   *                 value:
   *                   status: false
   *                   message: "No se pudo actualizar. Los materiales requeridos para crear el producto ya están ocupados. Intente con una cantidad para producción menor"
   *       404:
   *         description: Not Found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               orderNotFound:
   *                 summary: Orden no encontrada
   *                 value:
   *                   status: false
   *                   message: "Orden de producción no encontrada"
   *               materialsNotFound:
   *                 summary: Materiales no encontrados
   *                 value:
   *                   status: false
   *                   message: "Algunos materiales para la producción no existen en la base de datos"
   *       422:
   *         description: Unprocessable Entity
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             examples:
   *               invalidFields:
   *                 summary: Campos inválidos
   *                 value:
   *                   status: false
   *                   message:
   *                     - "La cantidad de producto fabricado debe ser mayor a 0"
   *               emptyBody:
   *                 summary: Cuerpo vacío
   *                 value:
   *                   status: false
   *                   message: "No se proporcionaron datos para actualizar"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot
    .route("/:id")
    .put(
      [
        verifyToken,
        isUser,
        validateIdMiddleware,
        validateProductionOrderFieldsMiddleware,
      ],
      UpdateProductionOrderController,
    )
    .get([verifyToken, validateIdMiddleware], GetProductByIdController);

  return routerRoot;
};
