import { Client } from "@/database/entities/Client";
import ClientRepository from "@/database/repositories/ClientRepository";
import {
	CreateUpdateClientReq,
	GetClientsListReq,
	IdParamReq,
	RequestAPI,
	ResponseAPI,
} from "@/typescript/express";
import { FindManyOptions, Like } from "typeorm";

export const createClient = async (
	req: CreateUpdateClientReq,
	res: ResponseAPI
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

		let client = ClientRepository.create({
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
		const { limit, nombreEmpresa, offset } = req.query;
		let take = Number(limit) || 10;
		let skip = Number(offset) || 0;

		let options: FindManyOptions<Client> = {
			take,
			skip,
		};
		if (nombreEmpresa?.length > 0) {
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
	res: ResponseAPI
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

		let client = await ClientRepository.findOneBy({ id: Number(id) });
		if (!client) {
			res.status(404).json({
				status: false,
				message: "Cliente no encontrado",
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
