import type { NextFunction } from "express";
import type { IAuthorization } from "../typescript/authJWT";
import type { RequestAPI, ResponseAPI } from "../typescript/express";

import jwt from "jsonwebtoken";

import { GlobalRepository } from "@/database/repositories/globalRepository";
import { jwtSecret } from "../constants";
const UserRepository = GlobalRepository.userRepository;

async function verifyToken(
  req: RequestAPI,
  resp: ResponseAPI,
  next: NextFunction,
) {
  try {
    const bearer = req.headers.authorization;
    const token = bearer?.split(" ")[1];

    if (!token) {
      resp.status(403).json({
        status: false,
        message: "Falta el token de autenticación",
      });

      return;
    }

    const decodeToken = jwt.verify(token, jwtSecret);

    // @ts-expect-error confiamos en que el objeto tiene la propiedad esperada
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-condition
    const user = await UserRepository.findOneBy({ id: decodeToken?.id });
    req.user = user;

    next();
  } catch (error) {
    console.log("verifyToken error:", String(error));
    resp.status(401).json({
      status: false,
      message: "No se pudo verificar el token de autenticación",
    });
  }
}

function isAuthorized({ rolToCheck, user }: IAuthorization) {
  return user?.rol.some((el) => el.rol === rolToCheck);
}

function isSuperAdmin(req: RequestAPI, resp: ResponseAPI, next: NextFunction) {
  if (!isAuthorized({ rolToCheck: "SUPERADMIN", user: req.user })) {
    resp.status(403).json({
      status: false,
      message:
        "Prohibido! Solo administradores pueden acceder a estas funciones",
    });

    return;
  }

  next();
}

function isUser(req: RequestAPI, res: ResponseAPI, next: NextFunction) {
  const Roles = ["USER", "SUPERADMIN"];
  let authorized = false;
  for (const rolToCheck of Roles) {
    if (isAuthorized({ rolToCheck, user: req.user })) {
      authorized = true;
      break;
    }
  }
  if (!authorized) {
    res.status(403).json({
      status: false,
      message:
        "Prohibido! Solo administradores y usuarios normales pueden acceder a estas funciones",
    });

    return;
  }
  next();
}

export { isSuperAdmin, isUser, verifyToken };
