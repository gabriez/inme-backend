import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Historial } from "@/database/entities/Historial";
import type { GetHistorialReq, ResponseAPI } from "@/typescript/express";

import {
  Between,
  Equal,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
} from "typeorm";

import { HistorialAction } from "@/database/entities/Historial";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const HistorialRepository = GlobalRepository.historialRepository;

export const GetHistory = async (req: GetHistorialReq, res: ResponseAPI) => {
  try {
    const {
      limit,
      offset,
      product,
      action,
      productId,
      providerId,
      clientId,
      startDate,
      endDate,
    } = req.query;

    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<Historial> = {};

    if (product && product.length > 0) {
      whereClause.product = { nombre: Like(`%${product}%`) };
    }

    if (productId) {
      whereClause.product = { id: Equal(Number(productId)) };
    }

    if (providerId) {
      whereClause.provider = { id: Equal(Number(providerId)) };
    }

    if (clientId) {
      whereClause.client = { id: Equal(Number(clientId)) };
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.create_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereClause.create_at = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereClause.create_at = LessThanOrEqual(new Date(endDate));
    }

    if (action && action.length > 0) {
      const validActions = Object.keys(HistorialAction);
      if (!validActions.includes(action as HistorialAction)) {
        res.status(422).json({
          status: false,
          message: `HistorialAction inválido. Los valores válidos son: INGRESO, EGRESO, VENTA, VARIOS, ORDENPRODUCCION, GASTODEPRODUCCION, INGRESOPORPRODUCCION, `,
        });
        return;
      }
      const enumAction =
        HistorialAction[action as keyof typeof HistorialAction];
      whereClause.action = Equal(enumAction);
    }

    const options: FindManyOptions<Historial> = {
      take,
      skip,
      where: whereClause,
      order: {
        create_at: "DESC",
      },
      select: {
        id: true,
        action: true,
        cantidad: true,
        client: {
          id: true,
          nombreEmpresa: true,
          ciRif: true,
        },
        product: {
          id: true,
          nombre: true,
          codigo: true,
        },
        description: true,
        provider: {
          id: true,
          enterpriseName: true,
          ciRif: true,
        },
        productionOrder: { id: true },
        create_at: true,
      },
      relations: {
        client: true,
        product: true,
        provider: true,
        productionOrder: true,
      },
    };

    const [history, total] = await HistorialRepository.findAndCount(options);
    res.status(200).json({
      status: true,
      data: { history, total },
      message: "Historial obtenido exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
    return;
  }
};
