import dotenv from "dotenv";
dotenv.config();

export const PORT_APP = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET ?? "jwtSecret";

export const DB = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT ?? "5432"),
  ssl: process.env.DB_SSL === "true",
};

export const ROOT_DIRECTORY = process.env.ROOT_DIRECTORY;
if (!ROOT_DIRECTORY) throw new Error("const ROOT_DIRECTORY undefined");

export const PRODUCTS_IMAGES_PATH = "products";

export const DEFAULT_ROLES = ["READER", "USER", "SUPERADMIN"];
