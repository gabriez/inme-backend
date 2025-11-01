import type { NextFunction } from "express";
import type { RequestAPI, ResponseAPI } from "@/typescript/express";

import path from "node:path";

import dayjs from "dayjs";
import multer, { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";

import { PRODUCTS_IMAGES_PATH, ROOT_DIRECTORY } from "@/constants";

const createMulterImages = (destination: string) => {
  const STORAGE = diskStorage({
    destination,
    filename: (_, file, cb) => {
      cb(null, uuidv4() + path.extname(file.originalname));
    },
  });

  const UPLOADS = multer({
    storage: STORAGE,
    fileFilter: (_, file, cb) => {
      const filetypes = /jpg|jpeg|png|webp|gif/;
      const mimetype = filetypes.test(file.mimetype);

      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );

      if (mimetype && extname) {
        cb(null, true);
        return;
      }

      cb(new Error("El archivo no es válido"));
    },
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB in bytes
    },
  });
  return UPLOADS;
};

export const storeProductImages = async (
  req: RequestAPI,
  res: ResponseAPI,
  next: NextFunction,
) => {
  const now = dayjs();
  const productsPath = path.join(
    ROOT_DIRECTORY ?? "/home/tmp/inme",
    PRODUCTS_IMAGES_PATH,
  );
  const destination = path.join(productsPath, now.format("YYYY/MM/DD"));
  const upload = createMulterImages(destination).single("image");
  try {
    await new Promise((resolve) => {
      upload(req, res, (err: unknown) => {
        if (err) {
          const parsedErr = err as { message: string; code: string };
          let message = parsedErr.message;

          if (parsedErr.code == "LIMIT_UNEXPECTED_FILE") {
            message =
              "Superó el límite de ficheros que puede subir por petición";
          }

          if (parsedErr.code == "LIMIT_FILE_SIZE") {
            message = "El archivo es demasiado grande. El tamaño máximo es 2MB";
          }

          return res.status(422).json({
            message,
            status: false,
          });
        }
        resolve(true);
      });
    });

    next();
  } catch (error) {
    console.log("> error in storeProductImages", error);
    return res.status(500).json({
      status: false,
      message:
        "Ocurrió un error inesperado, por favor vuelva  intentar más tarde.",
    });
  }
};
