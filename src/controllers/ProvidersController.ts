import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Providers } from "@/database/entities/Providers";
import type {
  CreateUpdateProvidersReq,
  GetProvidersListReq,
  IdParamReq,
  ResponseAPI,
} from "@/typescript/express";

import { ILike } from "typeorm";

import { GlobalRepository } from "@/database/repositories/globalRepository";

const ProvidersRepository = GlobalRepository.providersRepository;

export const getProvidersController = async (
  req: GetProvidersListReq,
  res: ResponseAPI,
) => {
  try {
    const {
      limit,
      offset,
      enterpriseName = "",
      email = "",
      personContact = "",
      ciRif = "",
    } = req.query;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<Providers> = {};

    // Aplicar filtros si existen
    if (typeof enterpriseName === "string" && enterpriseName.length > 0) {
      whereClause.enterpriseName = ILike(`%${enterpriseName}%`);
    }
    if (typeof email === "string" && email.length > 0) {
      whereClause.email = ILike(`%${email}%`);
    }
    if (typeof personContact === "string" && personContact.length > 0) {
      whereClause.personContact = ILike(`%${personContact}%`);
    }
    if (typeof ciRif === "string" && ciRif.length > 0) {
      whereClause.ciRif = ILike(`%${ciRif}%`);
    }

    const options: FindManyOptions<Providers> = {
      take,
      skip,
      where: whereClause,
    };

    const providers = await ProvidersRepository.find(options);
    const total = await ProvidersRepository.count(options);
    res.status(200).json({
      status: true,
      data: { providers, total },
      message: "Proveedores obtenidos exitosamente",
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

export const createProvidersController = async (
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

export const getProviderByIdController = async (
  req: IdParamReq,
  res: ResponseAPI,
) => {
  try {
    const { id } = req.params;
    const client = await ProvidersRepository.findOneBy({ id: Number(id) });
    if (!client) {
      res.status(404).json({
        status: false,
        message: "Proveedor no encontrado",
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: client,
      message: "Proveedor obtenido exitosamente",
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

export const updateProviderController = async (
  req: CreateUpdateProvidersReq,
  res: ResponseAPI,
) => {
  try {
    if (!req.body) {
      res.status(422).json({
        status: false,
        message: "No se proporcionaron datos para actualizar",
      });
      return;
    }

    const { id } = req.params;

    const provider = await ProvidersRepository.findOneBy({ id: Number(id) });
    if (!provider) {
      res.status(404).json({
        status: false,
        message: "Proveedor no encontrado",
      });
      return;
    }

    const providerByRifCi = await ProvidersRepository.findOneBy({
      ciRif: req.body.ciRif,
    });
    if (providerByRifCi && providerByRifCi.id !== provider.id) {
      res.status(409).json({
        status: false,
        message: "Ya existe un proveedor con el mismo CI/RIF",
      });
      return;
    }

    Object.assign(provider, req.body);

    await ProvidersRepository.save(provider);

    res.status(200).json({
      status: true,
      message: "Proveedor actualizado exitosamente",
      data: provider,
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
