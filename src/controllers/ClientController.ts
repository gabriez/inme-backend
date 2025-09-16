import type { FindManyOptions } from "typeorm";
import type { Client } from "@/database/entities/Client";
import type {
  CreateUpdateClientReq,
  GetClientsListReq,
  IdParamReq,
  ResponseAPI,
} from "@/typescript/express";

import { Like } from "typeorm";

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
    const { limit, nombreEmpresa = "", offset } = req.query;
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const options: FindManyOptions<Client> = {
      take,
      skip,
    };
    if (nombreEmpresa.length > 0) {
      options.where = { nombreEmpresa: Like(`%${nombreEmpresa}%`) };
    }

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

    // const clientExist = await ClientRepository.existsBy({ ciRif: req.body.ciRif });
    // if (clientExist) {
    //   res.status(409).json({
    //     status: false,
    //     message: "Ya existe un cliente con el mismo CI/RIF",
    //   });
    //   return;
    // }

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
