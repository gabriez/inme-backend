import type { NextFunction } from "express";
import type {
  CreateUserReq,
  ResponseAPI,
  UpdateUserReq,
} from "@/typescript/express";

import z from "zod";

const editUserSchema = z.object({
  password: z
    .string("Campo password es obligatorio")
    .nonempty("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener mínimo 8 caracteres"),
  username: z
    .string("Campo username es obligatorio")
    .nonempty("El username es obligatorio")
    .min(4, "El username debe ser mayor de 4 caracteres"),
  email: z.email("El email no es válido"),
  name: z
    .string("Campo name es obligatorio")
    .nonempty("El nombre es obligatorio")
    .min(3, "El nombre debe ser mayor de 3 caracteres"),
  rol: z.object({
    id: z.number("El id del rol es obligatorio y debe ser un numero"),
  }),
});

export function editUserMiddleware(
  req: UpdateUserReq,
  res: ResponseAPI,
  next: NextFunction,
) {
  const resErr = res.status(422);
  if (!req.body) {
    resErr.json({
      status: false,
      message: "No se proporcionaron datos en el cuerpo de solicitud",
    });
    return;
  }
  const { password, rol, email, name, updatePassword } = req.body;

  let schema = z.object({
    email: editUserSchema.shape.email,
    name: editUserSchema.shape.name,
    rol: editUserSchema.shape.rol,
  });

  if (updatePassword) {
    schema = schema.extend({ password: editUserSchema.shape.password });
  }

  const parse = schema.safeParse({
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

export function createUserMiddleware(
  req: CreateUserReq,
  res: ResponseAPI,
  next: NextFunction,
) {
  const resErr = res.status(422);
  if (!req.body) {
    resErr.json({
      status: false,
      message: "No se proporcionaron datos en el cuerpo de solicitud",
    });
    return;
  }
  const { name, email, username, password, rol } = req.body;
  const schema = editUserSchema;
  const parse = schema.safeParse({
    password,
    rol,
    email,
    name,
    username,
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
