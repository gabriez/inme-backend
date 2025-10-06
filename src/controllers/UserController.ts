import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Users } from "@/database/entities/Users";
import type {
  GetUsersReq,
  IdParamReq,
  RequestAPI,
  ResponseAPI,
  UpdateUserReq,
} from "../typescript/express";

import { Like } from "typeorm";

import { GlobalRepository } from "@/database/repositories/globalRepository";

const UserRepository = GlobalRepository.userRepository;
const RolesRepository = GlobalRepository.rolesRepository;

export const GetProfile = async (req: IdParamReq, res: ResponseAPI) => {
  try {
    const { id } = req.params;
    const user = await UserRepository.findOne({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        rol: { id: true, rol: true },
        name: true,
        verified: true,
      },
    });
    if (!user) {
      res.status(404).json({
        status: false,
        message: "El usuario no existe",
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: { user },
      message: "Usuario obtenido exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
};

export const GetUsers = async (req: GetUsersReq, res: ResponseAPI) => {
  try {
    const { email, limit, nombre, offset, rol, username } = req.query;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<Users> = {};

    if (email && email.length > 0) {
      whereClause.email = Like(`%${email}%`);
    }
    if (nombre && nombre.length > 0) {
      whereClause.name = Like(`%${nombre}%`);
    }
    if (username && username.length > 0) {
      whereClause.username = Like(`%${username}%`);
    }
    if (rol && Number(rol)) {
      whereClause.rol = { id: Number(rol) };
    }

    const options: FindManyOptions<Users> = {
      take,
      skip,
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        verified: true,
        rol: { id: true, rol: true },
      },
    };

    const [users, total] = await UserRepository.findAndCount(options);

    res.status(200).json({
      status: true,
      data: { total, users },
      message: "Usuarios obtenidos exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
};

export const EditProfile = async (req: UpdateUserReq, res: ResponseAPI) => {
  try {
    const { id } = req.params;
    const { name, email, rol, password } = req.body ?? {};

    const user = await UserRepository.findOneBy({ id: Number(id) });
    if (!user) {
      res.status(404).json({
        status: false,
        message: "El usuario no existe",
      });
      return;
    }

    const userEmail = await UserRepository.findOneBy({ email });

    if (userEmail) {
      res.status(422).json({
        data: null,
        status: false,
        message: "El email ya está en uso",
      });
      return;
    }

    if (!password) {
      res.status(422).json({
        status: false,
        message: "La contraseña no puede ser una cadena vacía",
      });
      return;
    }

    const samePassword = await user.comparePassword(password);
    let dataToUpdate: unknown = {};
    dataToUpdate = samePassword
      ? { name, email, rol: [rol] }
      : {
          password,
          name,
          email,
          rol: [rol],
        };

    Object.assign(user, dataToUpdate);

    await UserRepository.save(user);

    res.status(200).json({
      status: true,
      data: { user },
      message: "Usuario obtenido exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
};

export const GetRoles = async (_req: RequestAPI, res: ResponseAPI) => {
  try {
    const roles = await RolesRepository.find({
      select: {
        rol: true,
        id: true,
      },
    });

    res.status(200).json({
      status: true,
      data: { roles },
      message: "Roles obtenidos exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
};

export const VerifyUser = async (req: IdParamReq, res: ResponseAPI) => {
  try {
    const { id } = req.params;
    const user = await UserRepository.findOneBy({ id: Number(id) });
    if (!user) {
      res.status(404).json({
        status: false,
        message: "El usuario no existe",
      });
      return;
    }

    user.verified = true;
    await UserRepository.save(user);

    res.status(200).json({
      status: true,
      message: "Usuario verificado exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
};
