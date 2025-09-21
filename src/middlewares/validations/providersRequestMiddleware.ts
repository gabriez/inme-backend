import type { NextFunction } from "express";
import type {
  CreateUpdateProvidersReq,
  ResponseAPI,
} from "@/typescript/express";

import z from "zod";

const regexCedula = /^[VEJPGvejpg]{1}[0-9]{5,10}$/;
const providersSchema = z.object({
  enterpriseName: z
    .string("El nombre de la empresa debe ser una cadena")
    .min(3, "El nombre de la empresa debe tener al menos 3 caracteres")
    .max(70, "El nombre de la empresa no debe exceder los 100 caracteres"),
  personContact: z
    .string("El nombre del contacto debe ser una cadena")
    .min(3, "El nombre del contacto debe tener al menos 3 caracteres")
    .max(70, "El nombre del contacto no debe exceder los 100 caracteres"),
  enterprisePhone: z
    .string("El teléfono de la empresa debe ser una cadena")
    .min(7, "El teléfono de la empresa debe tener al menos 7 caracteres")
    .max(22, "El teléfono de la empresa no debe exceder los 22 caracteres"),
  description: z
    .string("La descripción de la empresa debe ser una cadena")
    .min(7, "La descripción de la empresa debe tener al menos 20 caracteres")
    .max(22, "La descripción de la empresa no debe exceder los 400 caracteres"),
  email: z
    .email("El email de la empresa no es válido")
    .max(150, "El email de la empresa no debe exceder los 150 caracteres")
    .optional(),
  ciRif: z
    .string("El CI/RIF debe ser una cadena")
    .min(6, "El CI/RIF debe tener al menos 6 caracteres")
    .max(11, "El CI/RIF no debe exceder los 11 caracteres")
    .refine((val) => regexCedula.test(val), {
      error: "El CI/RIF no es válido",
    }),
  taxAddress: z
    .string("La dirección fiscal debe ser una cadena")
    .min(10, "La dirección fiscal debe tener al menos 10 caracteres")
    .max(200, "La dirección fiscal no debe exceder los 200 caracteres"),
  address: z
    .string("La dirección debe ser una cadena")
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(200, "La dirección no debe exceder los 200 caracteres"),
  website: z
    .url("El website debe ser una URL válida")
    .max(300, "La URL no debe exceder los 300 caracteres")
    .optional(),
  instagram: z
    .url("La cuenta de Instagram debe ser una URL válida")
    .max(200, "La URL no debe exceder los 200 caracteres")
    .optional(),
});

export const providersRequestMiddleware = (
  req: CreateUpdateProvidersReq,
  res: ResponseAPI,
  next: NextFunction,
) => {
  const resErr = res.status(422);
  if (!req.body) {
    resErr.json({
      status: false,
      message: "No se proporcionaron datos en el cuerpo de solicitud",
    });
    return;
  }
  try {
    const {
      address,
      ciRif,
      description,
      email,
      enterpriseName,
      enterprisePhone,
      instagram,
      personContact,
      taxAddress,
      website,
    } = req.body;

    const parse = providersSchema.safeParse({
      address,
      ciRif,
      description,
      email,
      enterpriseName,
      enterprisePhone,
      instagram,
      personContact,
      taxAddress,
      website,
    });

    if (!parse.success) {
      const message = parse.error.issues.map((err) => err.message);
      resErr.json({
        status: false,
        message,
      });
      return;
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message:
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
    });
  }
};
