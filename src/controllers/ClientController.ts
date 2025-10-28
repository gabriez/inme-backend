import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Client } from "@/database/entities/Client";
import type {
  CreateUpdateClientReq,
  GetClientsListReq,
  IdParamReq,
  ResponseAPI,
} from "@/typescript/express";

import { ILike } from "typeorm";

import { GlobalRepository } from "@/database/repositories/globalRepository";

const ClientRepository = GlobalRepository.clientRepository;

export const createClient = async (
  req: CreateUpdateClientReq,
  res: ResponseAPI,
) => {
  try {
    const {
      ciRif,
      emailContacto,
      emailEmpresa,
      empresaTelefono,
      nombreContacto,
      direccionFiscal,
      nombreEmpresa,
    } = req.body ?? {};
    const clientExist = await ClientRepository.existsBy({ ciRif });
    if (clientExist) {
      res.status(409).json({
        status: false,
        message: "Ya existe un cliente con el mismo CI/RIF",
      });
      return;
    }

    const client = ClientRepository.create({
      ciRif,
      emailContacto,
      emailEmpresa,
      empresaTelefono,
      nombreContacto,
      direccionFiscal,
      nombreEmpresa,
    });
    await ClientRepository.save(client);
    res.status(201).json({
      status: true,
      data: client,
      message: "Cliente creado exitosamente!",
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

export const getClients = async (req: GetClientsListReq, res: ResponseAPI) => {
  try {
    const {
      limit,
      nombreEmpresa,
      emailEmpresa,
      nombreContacto,
      emailContacto,
      ciRif,
      offset,
    } = req.query;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<Client> = {};

    if (
      nombreEmpresa &&
      typeof nombreEmpresa === "string" &&
      nombreEmpresa.length > 0
    ) {
      whereClause.nombreEmpresa = ILike(`%${nombreEmpresa}%`);
    }
    if (
      emailEmpresa &&
      typeof emailEmpresa === "string" &&
      emailEmpresa.length > 0
    ) {
      whereClause.emailEmpresa = ILike(`%${emailEmpresa}%`);
    }
    if (
      nombreContacto &&
      typeof nombreContacto === "string" &&
      nombreContacto.length > 0
    ) {
      whereClause.nombreContacto = ILike(`%${nombreContacto}%`);
    }
    if (
      emailContacto &&
      typeof emailContacto === "string" &&
      emailContacto.length > 0
    ) {
      whereClause.emailContacto = ILike(`%${emailContacto}%`);
    }
    if (ciRif && typeof ciRif === "string" && ciRif.length > 0) {
      whereClause.ciRif = ILike(`%${ciRif}%`);
    }

    const options: FindManyOptions<Client> = {
      take,
      skip,
      where: whereClause,
    };

    const clients = await ClientRepository.find(options);
    const total = await ClientRepository.count(options);
    res.status(200).json({
      status: true,
      data: { clients, total },
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

export const getClientById = async (req: IdParamReq, res: ResponseAPI) => {
  try {
    const { id } = req.params;
    const client = await ClientRepository.findOneBy({ id: Number(id) });
    if (!client) {
      res.status(404).json({
        status: false,
        message: "Cliente no encontrado",
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: client,
      message: "Cliente obtenido exitosamente",
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

export const updateClient = async (
  req: CreateUpdateClientReq,
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

    const client = await ClientRepository.findOneBy({ id: Number(id) });
    if (!client) {
      res.status(404).json({
        status: false,
        message: "Cliente no encontrado",
      });
      return;
    }

    const clientByRifCi = await ClientRepository.findOneBy({
      ciRif: req.body.ciRif,
    });
    if (clientByRifCi && clientByRifCi.id !== client.id) {
      res.status(409).json({
        status: false,
        message: "Ya existe un cliente con el mismo CI/RIF",
      });
      return;
    }

    Object.assign(client, req.body);

    await ClientRepository.save(client);

    res.status(200).json({
      status: true,
      message: "Cliente actualizado exitosamente",
      data: client,
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
