import type {
  ExportDatabaseReq,
  ImportDatabaseReq,
  ResponseAPI,
} from "@/typescript/express";

import bcrypt from "bcryptjs";

import AppDataSource from "@/database/appDataSource";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const UserRepository = GlobalRepository.userRepository;

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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Archivo SQL generado exitosamente
 *         content:
 *           application/sql:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Credenciales inválidas o usuario no es administrador
 *       500:
 *         description: Error al exportar la base de datos
 */
export const exportDatabase = async (
  req: ExportDatabaseReq,
  res: ResponseAPI,
) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Datos requeridos",
      });
    }
    console.log(req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Usuario y contraseña son requeridos",
      });
    }

    // Verificar credenciales de administrador
    const user = await UserRepository.findOne({
      where: { username },
      relations: ["rol"],
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        data: null,
        message: "Credenciales inválidas",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        data: null,
        message: "Credenciales inválidas",
      });
    }

    // Verificar que sea administrador
    const isSuperAdmin = user.rol.some((r) => r.rol === "SUPERADMIN");
    if (!isSuperAdmin) {
      return res.status(403).json({
        status: false,
        data: null,
        message: "No tienes permisos para realizar esta acción",
      });
    }

    // Obtener todas las tablas
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    const tables = (await queryRunner.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
    )) as { table_name: string }[];

    let sqlDump = `-- Database Export\n-- Generated at: ${new Date().toISOString()}\n\n`;
    sqlDump += `SET client_encoding = 'UTF8';\n`;
    sqlDump += `SET standard_conforming_strings = on;\n\n`;

    // Exportar datos de cada tabla
    for (const { table_name } of tables) {
      // Omitir tablas de sistema y migraciones
      if (table_name === "migrations" || table_name.startsWith("pg_")) {
        continue;
      }

      sqlDump += `\n-- Table: ${table_name}\n`;

      // Obtener estructura de columnas
      const columns = (await queryRunner.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table_name}' ORDER BY ordinal_position`,
      )) as { column_name: string }[];

      const columnNames = columns.map((c) => c.column_name);

      // Obtener datos
      const data = (await queryRunner.query(
        `SELECT * FROM "${table_name}"`,
      )) as Record<string, unknown>[];

      if (data.length > 0) {
        for (const row of data) {
          const values = columnNames.map((col: string) => {
            const value: unknown = row[col];
            if (value === null || value === undefined) return "NULL";
            if (typeof value === "boolean") return value ? "true" : "false";
            if (typeof value === "number") return value;
            if (typeof value === "object") {
              return `'${JSON.stringify(value).replaceAll("'", "''")}'`;
            }
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            return `'${String(value).replaceAll("'", "''")}'`;
          });

          sqlDump += `INSERT INTO "${table_name}" (${columnNames.map((c: string) => `"${c}"`).join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;\n`;
        }
      }
    }

    await queryRunner.release();

    // Enviar archivo SQL
    const filename = `database_export_${new Date().toISOString().split("T")[0]}.sql`;
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(sqlDump);
  } catch (error) {
    console.error("Error exporting database:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Error al exportar la base de datos",
    });
  }
};

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
 *               password:
 *                 type: string
 *               sqlContent:
 *                 type: string
 *                 description: Contenido del archivo SQL
 *     responses:
 *       200:
 *         description: Base de datos importada exitosamente
 *       401:
 *         description: Credenciales inválidas o usuario no es administrador
 *       500:
 *         description: Error al importar la base de datos
 */
export const importDatabase = async (
  req: ImportDatabaseReq,
  res: ResponseAPI,
) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Datos requeridos",
      });
    }

    const { username, password, sqlContent } = req.body;

    if (!username || !password || !sqlContent) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Usuario, contraseña y contenido SQL son requeridos",
      });
    }

    // Verificar credenciales de administrador
    const user = await UserRepository.findOne({
      where: { username },
      relations: ["rol"],
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        data: null,
        message: "Credenciales inválidas",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        data: null,
        message: "Credenciales inválidas",
      });
    }

    // Verificar que sea administrador
    const isSuperAdmin = user.rol.some((r) => r.rol === "SUPERADMIN");
    if (!isSuperAdmin) {
      return res.status(403).json({
        status: false,
        data: null,
        message: "No tienes permisos para realizar esta acción",
      });
    }

    // Ejecutar SQL
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Dividir el contenido SQL en statements individuales
      const statements = sqlContent
        .split("\n")
        .map((s: string) => s.trim())
        .filter(
          (s: string) =>
            s.length > 0 && !s.startsWith("--") && !s.startsWith("SET"),
        );

      for (const statement of statements) {
        if (statement.toUpperCase().startsWith("INSERT")) {
          await queryRunner.query(statement);
        }
      }

      await queryRunner.commitTransaction();

      res.json({
        status: true,
        data: null,
        message: "Base de datos importada exitosamente",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("Error importing database:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Error al importar la base de datos",
    });
  }
};
