import type { Express } from "express";

import { Router } from "express";

// Routes
import { authRoutes } from "./authRouters";
import { clientRouters } from "./clientRouters";
import { swaggerDocs } from "./swagger";
import { userRouters } from "./userRouters";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *    BearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
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
 *     ErrorSecuritySchema:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         data:
 *           type: null
 *         message:
 *           type: string
 *       example:
 *         status: false
 *         data: null
 *         message: "Falta el token de autenticación"
 *     ErrorValidationToken:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         data:
 *           type: null
 *         message:
 *           type: string
 *       example:
 *         status: false
 *         data: null
 *         message: "No se pudo verificar el token de autenticación"
 *     ErrorUnexpectedSchema:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         data:
 *           type: null
 *         message:
 *           type: string
 *       example:
 *         status: false
 *         data: null
 *         message: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde"
 * security:
 *   - BearerAuth: []
 */

// TODO: add 401 error
export const routes = (app: Express): Express => {
  const router = Router();

  return app.use(
    "/api/v1.0",
    router.use("/auth", authRoutes()),
    router.use("/user", userRouters()),
    router.use("/docs", swaggerDocs()),
    router.use("/client", clientRouters()),
  );
};
