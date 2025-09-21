import type { FindManyOptions } from "typeorm";
import type { Providers } from "@/database/entities/Providers";
import type {
  CreateUpdateProvidersReq,
  GetProvidersListReq,
  ResponseAPI,
} from "@/typescript/express";

import { Like } from "typeorm";

import { GlobalRepository } from "@/database/repositories/globalRepository";

const ProvidersRepository = GlobalRepository.providersRepository;

export const GetProvidersController = async (
  req: GetProvidersListReq,
  res: ResponseAPI,
) => {
  try {
    const { limit, enterpriseName = "", offset } = req.query;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const options: FindManyOptions<Providers> = {
      take,
      skip,
    };
    if (enterpriseName.length > 0) {
      options.where = { enterpriseName: Like(`%${enterpriseName}%`) };
    }

    const providers = await ProvidersRepository.find(options);
    const total = await ProvidersRepository.count(options);
    res.status(200).json({
      status: true,
      data: { providers, total },
      message: "Clientes obtenidos exitosamente",
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

export const CreateProvidersController = async (
  req: CreateUpdateProvidersReq,
  res: ResponseAPI,
) => {
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
    } = req.body ?? {};
    const providerExist = await ProvidersRepository.existsBy({ ciRif });
    if (providerExist) {
      res.status(409).json({
        status: false,
        message: "Ya existe un proveedor con el mismo CI/RIF",
      });
      return;
    }

    const provider = ProvidersRepository.create({
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
    await ProvidersRepository.save(provider);
    res.status(201).json({
      status: true,
      data: provider,
      message: "Proveedor creado exitosamente!",
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
