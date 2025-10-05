import { Router } from "express";

import { GetHistory } from "@/controllers/HistorialController";
import { verifyToken } from "@/middlewares/authJWT";

export const historialRouters = (): Router => {
  const routerRoot = Router();

  /**
   * @swagger
   * /api/v1.0/history:
   *   get:
   *     summary: Obtener el historial de movimientos de inventario
   *     security:
   *       - BearerAuth: []
   *     tags: [Historial]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *         description: Número máximo de registros a retornar (por defecto 10)
   *       - in: query
   *         name: offset
   *         schema:
   *           type: number
   *         description: Número de registros a omitir (por defecto 0)
   *       - in: query
   *         name: product
   *         schema:
   *           type: string
   *         description: Filtrar por nombre de producto (coincidencia parcial)
   *       - in: query
   *         name: action
   *         schema:
   *           type: string
   *           enum: [INGRESO, EGRESO, VENTA, VARIOS, ORDENPRODUCCION, GASTODEPRODUCCION, INGRESOPORPRODUCCION]
   *         description: Filtrar por tipo de acción del historial
   *     responses:
   *       200:
   *         description: Historial obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Historial obtenido exitosamente"
   *               data:
   *                 history:
   *                   - id: 1
   *                     action: "ingreso"
   *                     cantidad: 50
   *                     description: "Ingreso de materiales del proveedor ABC"
   *                     product:
   *                       id: 5
   *                       nombre: "Tornillo 1/4"
   *                     provider:
   *                       id: 1
   *                       enterpriseName: "Proveedor ABC"
   *                     client: null
   *                     productionOrder: null
   *                   - id: 2
   *                     action: "venta"
   *                     cantidad: 10
   *                     description: "Venta a cliente XYZ"
   *                     product:
   *                       id: 5
   *                       nombre: "Tornillo 1/4"
   *                     provider: null
   *                     client:
   *                       id: 3
   *                       nombreEmpresa: "Cliente XYZ"
   *                     productionOrder: null
   *                   - id: 3
   *                     action: "Gasto por orden de producción"
   *                     cantidad: 30
   *                     description: "Gasto por orden de producción 1"
   *                     product:
   *                       id: 2
   *                       nombre: "Acero inoxidable"
   *                     provider: null
   *                     client: null
   *                     productionOrder:
   *                       id: 1
   *                 total: 3
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
   *             example:
   *               status: false
   *               message: "HistorialAction inválido. Los valores válidos son: INGRESO, EGRESO, VENTA, VARIOS, ORDENPRODUCCION, GASTODEPRODUCCION, INGRESOPORPRODUCCION"
   *       500:
   *         content:
   *           text/plain; charset=utf-8:
   *             schema:
   *               $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  routerRoot.get("/", [verifyToken], GetHistory);
  return routerRoot;
};
