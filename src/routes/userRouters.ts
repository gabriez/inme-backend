import { Router } from "express";

import { profile } from "../controllers/UserController";
import { verifyToken } from "../middlewares/authJWT";

export const userRouters = () => {
  const routerRoot = Router();

  /**
   * @swagger
   * /api/v1.0/user/profile:
   *   get:
   *     summary: Obtener Usuarios
   *     tags: [Usuarios]
   *     security:
   *      - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success New User!
   *         content:
   *           application/json:
   *             schema:
   *              type: object
   *              $ref: '#/components/schemas/RegisterResponse'
   *       400:
   *        description: It is necessary to indicate the parameters 'firstName' and 'lastName' for the creation of a user
   *       500:
   *        description: Error message
   */
  routerRoot.get("/profile", verifyToken, profile);

  return routerRoot;
};
