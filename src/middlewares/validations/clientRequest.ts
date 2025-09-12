import type { Response } from "express";
import type { CreateUpdateClientReq } from "../../typescript/express";

import { z } from "zod";

const regexCedula = /^[VEJPGvejpg]{1}[0-9]{5,10}$/;
const clientSchema = z.object({
  nombreContacto: z
    .string("El nombre del contacto debe ser una cadena")
    .min(3, "El nombre del contacto debe tener al menos 3 caracteres")
    .max(70, "El nombre del contacto no debe exceder los 70 caracteres"),
  nombreEmpresa: z
    .string("El nombre de la empresa debe ser una cadena")
    .min(3, "El nombre de la empresa debe tener al menos 3 caracteres")
    .max(70, "El nombre de la empresa no debe exceder los 70 caracteres"),
  empresaTelefono: z
    .string("El teléfono de la empresa debe ser una cadena")
    .min(7, "El teléfono de la empresa debe tener al menos 7 caracteres")
    .max(22, "El teléfono de la empresa no debe exceder los 22 caracteres"),
  emailEmpresa: z
    .email("El email de la empresa no es válido")
    .max(150, "El email de la empresa no debe exceder los 150 caracteres")
    .optional(),
  emailContacto: z
    .email("El email del contacto no es válido")
    .max(150, "El email del contacto no debe exceder los 150 caracteres")
    .optional(),
  ciRif: z
    .string("El CI/RIF debe ser una cadena")
    .refine((val) => regexCedula.test(val), { error: "El CI/RIF no es válido" })
    .min(6, "El CI/RIF debe tener al menos 6 caracteres")
    .max(150, "El CI/RIF no debe exceder los 150 caracteres"),
  direccionFiscal: z
    .string("La dirección fiscal debe ser una cadena")
    .min(10, "La dirección fiscal debe tener al menos 10 caracteres")
    .max(350, "La dirección fiscal no debe exceder los 350 caracteres"),
});

export function validateClient(
  req: CreateUpdateClientReq,
  res: Response,
  next: () => void,
) {
  const resErr = res.status(422);
  if (!req.body) {
    res.status(422).json({
      status: false,
      message: "No se proporcionaron datos en el cuerpo de solicitud",
    });
    return;
  }
  try {
    const {
      ciRif,
      direccionFiscal,
      emailContacto,
      emailEmpresa,
      empresaTelefono,
      nombreContacto,
      nombreEmpresa,
    } = req.body;

    const parse = clientSchema.safeParse({
      ciRif,
      direccionFiscal,
      emailContacto,
      emailEmpresa,
      empresaTelefono,
      nombreContacto,
      nombreEmpresa,
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
}
