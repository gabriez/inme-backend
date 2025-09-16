import type { Response } from "express";
import type { IsignUpReq } from "../../typescript/express";

import { z } from "zod";

const signUpSchema = z.object({
  password: z
    .string()
    .nonempty("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener mínimo 8 caracteres"),
  username: z
    .string()
    .nonempty("El username es obligatorio")
    .min(4, "El username debe ser mayor de 4 caracteres"),
  email: z.email("El email no es válido"),
  name: z
    .string()
    .nonempty("El nombre es obligatorio")
    .min(3, "El nombre debe ser mayor de 3 caracteres"),
});

/* Validate that the data provided by the useris valid to process the request */
export function signUpRule(req: IsignUpReq, res: Response, next: () => void) {
  const resErr = res.status(422);
  const { password, username, email, name } = req.body ?? {};

  const parse = signUpSchema.safeParse({
    password,
    username,
    email,
    name,
  });
  try {
    if (!parse.success) {
      const message = parse.error.issues.map((err) => err.message);
      resErr.json({
        status: false,
        message,
      });
      return;
    }

    if (!password || !username) {
      resErr.json({
        status: false,
        message: "El username y la contraseña son obligatorios",
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
