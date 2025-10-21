import { Router } from "express";

import { GetStatistics } from "@/controllers/StatisticsController";
import { verifyToken } from "@/middlewares/authJWT";

/**
 * @swagger
 * components:
 *   schemas:
 *     MonthlyOrderStats:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           description: Nombre del mes (Ene, Feb, Mar, etc.)
 *         value:
 *           type: number
 *           description: Cantidad de órdenes finalizadas en ese mes
 *     ProductUsageStats:
 *       type: object
 *       properties:
 *         municipio:
 *           type: string
 *           description: Nombre del producto o material
 *         productos:
 *           type: number
 *           description: Cantidad total utilizada
 *     ProductSalesStats:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         productos:
 *           type: number
 *           description: Cantidad total vendida
 *     StatisticsData:
 *       type: object
 *       properties:
 *         monthlyOrders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MonthlyOrderStats'
 *         mostUsedProducts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductUsageStats'
 *         topSalesProducts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductSalesStats'
 */

export const statisticsRouters = (): Router => {
  const routerRoot = Router();

  /**
   * @swagger
   * /api/v1.0/statistics:
   *   get:
   *     summary: Obtener estadísticas del dashboard
   *     security:
   *       - BearerAuth: []
   *     tags: [Estadísticas]
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *             example:
   *               status: true
   *               message: "Estadísticas obtenidas exitosamente"
   *               data:
   *                 monthlyOrders:
   *                   - month: "Ene"
   *                     value: 3
   *                   - month: "Feb"
   *                     value: 5
   *                 mostUsedProducts:
   *                   - municipio: "Tornillo M8"
   *                     productos: 150
   *                   - municipio: "Tuerca M8"
   *                     productos: 120
   *                 topSalesProducts:
   *                   - nombre: "Producto A"
   *                     productos: 50
   *                   - nombre: "Producto B"
   *                     productos: 30
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
   */
  routerRoot.get("/", [verifyToken], GetStatistics);

  return routerRoot;
};
