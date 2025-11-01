import { Router } from "express";

import {
  exportDatabase,
  importDatabase,
} from "@/controllers/DatabaseController";

export const databaseRouters = () => {
  const router = Router();

  /**
   * @swagger
   * tags:
   *   name: Database
   *   description: Endpoints para exportar e importar base de datos
   */

  /**
   * @swagger
   * /api/v1.0/database/export:
   *   post:
   *     summary: Exportar base de datos a SQL
   *     tags: [Database]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: admin
   *               password:
   *                 type: string
   *                 example: admin123
   *     responses:
   *       200:
   *         description: Archivo SQL generado exitosamente
   *         content:
   *           application/sql:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         $ref: '#/components/schemas/ErrorSecuritySchema'
   *       403:
   *         $ref: '#/components/schemas/ErrorSecuritySchema'
   *       500:
   *         $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  router.post("/export", exportDatabase);

  /**
   * @swagger
   * /api/v1.0/database/import:
   *   post:
   *     summary: Importar base de datos desde SQL
   *     tags: [Database]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *               - sqlContent
   *             properties:
   *               username:
   *                 type: string
   *                 example: admin
   *               password:
   *                 type: string
   *                 example: admin123
   *               sqlContent:
   *                 type: string
   *                 description: Contenido del archivo SQL a importar
   *     responses:
   *       200:
   *         description: Base de datos importada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericResponseSchema'
   *       401:
   *         $ref: '#/components/schemas/ErrorSecuritySchema'
   *       403:
   *         $ref: '#/components/schemas/ErrorSecuritySchema'
   *       500:
   *         $ref: '#/components/schemas/ErrorUnexpectedSchema'
   */
  router.post("/import", importDatabase);

  return router;
};
