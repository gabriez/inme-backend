import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Users } from "@/database/entities/Users";
import type {
  CreateUserReq,
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

    console.log(limit, offset, nombre, rol, username);
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
    console.log(users);
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

export const createUser = async (req: CreateUserReq, res: ResponseAPI) => {
  try {
    if (!req.body) {
      res.status(422).json({
        status: false,
        message: "No se proporcionaron datos para actualizar",
      });
      return;
    }
    const { name, email, username, password, rol } = req.body;
    if (!name || !email || !username || !password) {
      res.status(422).json({
        data: null,
        status: false,
        message: "Por favor envíe su nombre, email, username y contraseña",
      });
      return;
    }
    const user = await UserRepository.findOneBy([{ username }, { email }]);
    if (user) {
      const message = [];
      if (user.username === username) {
        message.push("El usuario ya existe");
      }
      if (user.email === email) {
        message.push("El email ya está en uso");
      }

      res.status(422).json({
        data: null,
        status: false,
        message,
      });

      return;
    }
    const role = await RolesRepository.findOneBy({ id: rol.id });
    if (!role) {
      res.status(422).json({
        data: null,
        status: false,
        message: "El rol no existe",
      });
      return;
    }

    const newUser = UserRepository.create({
      name,
      email,
      username,
      password,
      rol: [role],
    });
    await UserRepository.save(newUser);
    res.status(201).json({
      status: true,
      data: {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        rol: newUser.rol,
        verified: newUser.verified,
        id: newUser.id,
      },
      message: "Usuario creado exitosamente!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message:
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
    });
  }
};

export const EditProfile = async (req: UpdateUserReq, res: ResponseAPI) => {
  try {
    if (!req.body) {
      res.status(422).json({
        status: false,
        message: "No se proporcionaron datos para actualizar",
      });
      return;
    }
    const { id } = req.params;
    const { name, email, rol, password, updatePassword } = req.body;

    const user = await UserRepository.findOne({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        password: true,
        verified: true,
        rol: { id: true, rol: true },
      },
    });
    if (!user) {
      res.status(404).json({
        status: false,
        message: "El usuario no existe",
      });
      return;
    }

    const userEmail = await UserRepository.findOneBy({ email });

    if (userEmail && userEmail.id !== user.id) {
      res.status(422).json({
        data: null,
        status: false,
        message: "El email ya está en uso",
      });
      return;
    }
    const role = await RolesRepository.findOneBy({ id: rol.id });
    if (!role) {
      res.status(422).json({
        data: null,
        status: false,
        message: "El rol no existe",
      });
      return;
    }
    if (updatePassword) {
      if (!password) {
        res.status(422).json({
          status: false,
          message: "La contraseña no puede ser una cadena vacía",
        });
        return;
      }
      Object.assign(user, {
        password,
        name,
        email,
        rol: [rol],
      });
    } else {
      Object.assign(user, {
        name,
        email,
        rol: [rol],
      });
    }

    await UserRepository.save(user);

    res.status(200).json({
      status: true,
      data: { user },
      message: "Usuario editado exitosamente",
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
