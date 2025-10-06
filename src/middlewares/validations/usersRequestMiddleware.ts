import type { ResponseAPI, UpdateUserReq } from "@/typescript/express";

import z from "zod";

const editUserSchema = z.object({
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
  rol: z.object({
    id: z.number("El id del rol es obligatorio y debe ser un numero"),
  }),
});

export function editUserMiddleware(
  req: UpdateUserReq,
  res: ResponseAPI,
  next: () => void,
) {
  const resErr = res.status(422);
  if (!req.body) {
    resErr.json({
      status: false,
      message: "No se proporcionaron datos en el cuerpo de solicitud",
    });
    return;
  }
  const { password, rol, email, name } = req.body;

  const parse = editUserSchema.safeParse({
    password,
    rol,
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
