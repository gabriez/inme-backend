import type { NextFunction } from "express";
import type {
  CreateUpdateProductsReq,
  ResponseAPI,
  UpdateProductExistenceReq,
} from "@/typescript/express";

import { In } from "typeorm";
import { z } from "zod";

import { HistorialAction } from "@/database/entities/Historial";
import { ProductType } from "@/database/entities/Products";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const ProductsRepository = GlobalRepository.productsRepository;
const ProvidersRepository = GlobalRepository.providersRepository;
const ClientRepository = GlobalRepository.clientRepository;

const validateProductsSchema = z.object({
  codigo: z.string().min(1).max(50),
  nombre: z.string().min(1).max(100),
  planos: z
    .url("Debe ser una url válida")
    .max(500, "La URL debe tener un máximo de 500 caracteres"),
  measureUnit: z.string().min(1).max(50),
  materialsList: z.array(
    z.object({
      id: z.number(),
      quantity: z.number().min(0.1, "La cantidad debe ser mayor a 0"),
    }),
  ),
  providersList: z.array(
    z.object({
      id: z.number(),
    }),
  ),
});

export function validateProductFields(
  req: CreateUpdateProductsReq,
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
  try {
    const {
      codigo,
      materialsList,
      providersList,
      measureUnit,
      planos,
      nombre,
    } = req.body;

    const parse = validateProductsSchema.safeParse({
      codigo,
      materialsList,
      providersList,
      measureUnit,
      planos,
      nombre,
    });

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
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
}

export async function validateProvidersExistence(
  req: CreateUpdateProductsReq,
  res: ResponseAPI,
  next: NextFunction,
) {
  try {
    const resErr = res.status(422);
    if (!req.body) {
      resErr.json({
        status: false,
        message: "No se proporcionaron datos en el cuerpo de solicitud",
      });
      return;
    }
    const { providersList = [] } = req.body;
    const providersListIds = providersList.map((provider) => provider.id);
    const providersListLookedUp = await ProvidersRepository.find({
      where: {
        id: In(providersListIds),
      },
    });
    if (providersListLookedUp.length !== providersListIds.length) {
      res.status(400).json({
        status: false,
        message: "Algunos proveedores no existen",
      });
      return;
    }
    req.body.providers = providersListLookedUp;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
}

export async function validateMaterialsExistence(
  req: CreateUpdateProductsReq,
  res: ResponseAPI,
  next: NextFunction,
) {
  try {
    const { materialsList = [] } = req.body ?? {};
    const materialsListIds = materialsList.map((material) => material.id);
    const materialsListLookedUp = await ProductsRepository.find({
      where: {
        id: In(materialsListIds),
      },
    });
    if (materialsListLookedUp.length !== materialsListIds.length) {
      res.status(400).json({
        status: false,
        message: "Algunos materiales no existen",
      });
      return;
    }
    let productType: ProductType = ProductType.INSUMOS;
    for (const material of materialsListLookedUp) {
      switch (material.productType) {
        case ProductType.COMPUESTOS: {
          productType = ProductType.COMPUESTOS;
          break;
        }
        case ProductType.SENCILLOS: {
          productType = ProductType.COMPUESTOS;
          break;
        }
        case ProductType.INSUMOS: {
          productType = ProductType.SENCILLOS;
          break;
        }
      }
      if (productType === ProductType.COMPUESTOS) break;
    }
    if (req.body) {
      req.body.productType = productType;
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
}

export async function validateProdExistenceChangeMiddleware(
  req: UpdateProductExistenceReq,
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
  try {
    const { quantity, action, description, provider, client } = req.body;

    if (provider?.id) {
      const providerExist = await ProvidersRepository.exists({
        where: { id: provider.id },
      });
      if (!providerExist) {
        resErr.json({
          status: false,
          message: "El proveedor seleccionado no existe",
        });
        return;
      }
    }

    if (client?.id) {
      const clientExist = await ClientRepository.exists({
        where: { id: client.id },
      });
      if (!clientExist) {
        resErr.json({
          status: false,
          message: "El cliente seleccionado no existe",
        });
        return;
      }
    }

    if (description.length > 300) {
      resErr.json({
        status: false,
        message: "La descripción debe tener un máximo de 300 caracteres",
      });
      return;
    }

    if (description.length < 20) {
      resErr.json({
        status: false,
        message: "La descripción debe tener un mínimo de 20 caracteres",
      });
      return;
    }

    if (!action || action.length === 0) {
      resErr.json({
        status: false,
        message:
          "No se envió la acción correspondiente. Valores válidos: INGRESO, EGRESO, VENTA, VARIOS",
      });
    }

    const validActions = Object.keys(HistorialAction);
    if (!validActions.includes(action as HistorialAction)) {
      resErr.json({
        status: false,
        message: `HistorialAction inválido. Los valores válidos son: INGRESO, EGRESO, VENTA, VARIOS`,
      });
      return;
    }
    const enumAction = HistorialAction[action as keyof typeof HistorialAction];

    if (
      enumAction === HistorialAction.GASTODEPRODUCCION ||
      enumAction === HistorialAction.INGRESOPORPRODUCCION ||
      enumAction === HistorialAction.ORDENPRODUCCION
    ) {
      resErr.json({
        status: false,
        message: `HistorialAction inválido. Los valores válidos para ingreso y egreso son: INGRESO, EGRESO, VENTA, VARIOS`,
      });
      return;
    }

    req.body.actionEnum = enumAction;

    if (quantity < 0) {
      resErr.json({
        status: false,
        message: "La cantidad debe ser mayor a 0",
      });
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
  }
}
