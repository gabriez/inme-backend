import type { NextFunction } from "express";
import type {
  ChangeOrderStateReq,
  CreateUpdateProductsOrdersReq,
  ResponseAPI,
} from "@/typescript/express";

import z from "zod";

import { HistorialAction } from "@/database/entities/Historial";
import { OrderState } from "@/database/entities/ProductionOrders";

const isAfterToday = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(d);
  candidate.setHours(0, 0, 0, 0);
  return candidate > today;
};

const productionOrderSchema = z.object({
  cantidadProductoFabricado: z
    .number("La cantidad de producto fabricado es obligatoria")
    .gt(0, "La cantidad de producto fabricado debe ser mayor a 0"),
  endDate: z
    .preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      return arg;
    }, z.date("La fecha de finalizacion es obligatoria"))
    .refine(isAfterToday, {
      message: "La fecha de finalización debe ser posterior a hoy",
    }),
  product: z.object({
    id: z.number("El id debe ser un numero"),
  }),
  responsables: z
    .string("Los responsables deben estar en formato de cadena de texto")
    .min(10, "Deben tener como mínimo 10 caracteres para los responsables")
    .max(400, "Máximo 400 caracteres para los responsables"),
});

export function validateProductionOrderFieldsMiddleware(
  req: CreateUpdateProductsOrdersReq,
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
    const { cantidadProductoFabricado, endDate, product, responsables } =
      req.body;

    const parse = productionOrderSchema.safeParse({
      cantidadProductoFabricado,
      endDate,
      product,
      responsables,
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

export function validateOrderState(
  req: ChangeOrderStateReq,
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

  const { orderState } = req.body;

  if (!orderState || orderState.length === 0) {
    resErr.json({
      status: false,
      message:
        "No se envió el estado de orden correspondiente. Valores válidos: EnProceso, Ejecutada, Cancelada, PorIniciar",
    });
  }
  const validOrders = Object.keys(OrderState);
  console.log(orderState, validOrders, OrderState);
  console.log(HistorialAction);

  if (!validOrders.includes(orderState as OrderState)) {
    resErr.json({
      status: false,
      message: `OrderState inválido. Los valores válidos son: EnProceso, Ejecutada, Cancelada, PorIniciar`,
    });
    return;
  }
  const orderStateEnum = OrderState[orderState as keyof typeof OrderState];
  console.log(orderStateEnum);
  req.body.orderStateEnum = orderStateEnum;
  next();
}
