import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Historial } from "@/database/entities/Historial";
import type { ProductionOrders } from "@/database/entities/ProductionOrders";
import type { Products } from "@/database/entities/Products";
import type {
  ChangeOrderStateReq,
  CreateUpdateProductsOrdersReq,
  GetProductsOrdersListReq,
  ResponseAPI,
} from "@/typescript/express";

import { Equal, In, Like } from "typeorm";

import { HistorialAction } from "@/database/entities/Historial";
import { OrderState } from "@/database/entities/ProductionOrders";
import { getProductWithRelations } from "@/database/helpers/productsHelpers";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const ProductsRepository = GlobalRepository.productsRepository;
const ProductionOrdersRepository = GlobalRepository.productionOrderRepository;
const HistorialRepository = GlobalRepository.historialRepository;

/**
 * Procesa la finalización de una orden de producción ejecutada:
 * - Reduce la existencia y existenciaReservada de los materiales
 * - Incrementa la existencia del producto final
 * - Crea registros de historial para ambas operaciones
 * @returns Objeto con queries para ejecutar o error con código de estado y mensaje
 */
const processProductionOrderCompletion = async (
  productionOrder: ProductionOrders,
): Promise<
  | {
      success: true;
      queries: Promise<Products[] | Historial[]>[];
    }
  | { success: false; status: number; message: string }
> => {
  // Procesar materiales: reducir existencia y existenciaReservada
  const materialsChanges = [];
  const historialChanges = [];

  const materialsListIds = productionOrder.product.materialsList.map(
    (item) => item.idProdComponenteId,
  );

  const materialsList = await ProductsRepository.find({
    where: {
      id: In(materialsListIds),
    },
  });

  if (materialsListIds.length !== materialsList.length) {
    return {
      success: false,
      status: 400,
      message:
        "Algunos materiales para la producción no existen en la base de datos",
    };
  }

  for (const material of productionOrder.product.materialsList) {
    const product = materialsList.find(
      (item) => item.id == material.idProdComponenteId,
    );

    if (!product) {
      return {
        success: false,
        status: 404,
        message: "Producto no encontrado",
      };
    }

    const totalMaterialQuantity =
      material.quantity * productionOrder.cantidadProductoFabricado;

    if (
      product.existenciaReservada + totalMaterialQuantity >
      product.existencia
    ) {
      return {
        success: false,
        status: 400,
        message: `No se puede aumentar la existencia reservada del producto ${product.codigo} - ${product.nombre} a un valor mayor que la existencia total. Revisa el intentario y las ordenes en producción`,
      };
    }

    if (product.existencia < totalMaterialQuantity) {
      return {
        success: false,
        status: 400,
        message: `No se puede reducir la existencia del producto ${product.codigo} - ${product.nombre} a menos de cero. Revisa el inventario`,
      };
    }

    product.existenciaReservada =
      product.existenciaReservada - totalMaterialQuantity;
    product.existencia = product.existencia - totalMaterialQuantity;

    const story = HistorialRepository.create({
      action: HistorialAction.GASTODEPRODUCCION,
      cantidad: totalMaterialQuantity,
      product,
      productionOrder,
      description: `Gasto por orden de producción número ${productionOrder.id}`,
    });

    historialChanges.push(story);
    materialsChanges.push(product);
  }

  // Procesar producto final: incrementar existencia
  const product = await ProductsRepository.findOneBy({
    id: productionOrder.product.id,
  });

  if (!product) {
    return {
      success: false,
      status: 404,
      message: "Producto no encontrado",
    };
  }

  product.existencia =
    product.existencia + productionOrder.cantidadProductoFabricado;

  const story = HistorialRepository.create({
    action: HistorialAction.INGRESOPORPRODUCCION,
    cantidad: productionOrder.cantidadProductoFabricado,
    product,
    productionOrder,
    description: `Ingreso por orden de producción ${productionOrder.id}`,
  });

  const productionOrderStory = HistorialRepository.create({
    action: HistorialAction.ORDENPRODUCCION,
    description: `Orden de producción número ${productionOrder.id} culminada`,
    productionOrder: productionOrder,
    cantidad: 0,
  });

  historialChanges.push(story, productionOrderStory);
  materialsChanges.push(product);

  return {
    success: true,
    queries: [
      ProductsRepository.save(materialsChanges),
      HistorialRepository.save(historialChanges),
    ],
  };
};

/**
 *
 * @param productionOrder
 * - Reduce la existencia reservada para los materiales de las ordenes de producción canceladas
 * @returns Objeto con queries para ejecutar o error con código de estado y mensaje
 */

const processProductionOrderCancel = async (
  productionOrder: ProductionOrders,
): Promise<
  | { success: true; query: Promise<Products[]> }
  | { success: false; status: number; message: string }
> => {
  const revertChanges = [];
  const materialsListIds = productionOrder.product.materialsList.map(
    (item) => item.idProdComponenteId,
  );

  const materialsList = await ProductsRepository.find({
    where: {
      id: In(materialsListIds),
    },
  });

  if (materialsListIds.length !== materialsList.length) {
    return {
      success: false,
      status: 404,
      message:
        "Algunos materiales para la producción no existen en la base de datos",
    };
  }

  for (const material of productionOrder.product.materialsList) {
    const product = materialsList.find(
      (item) => item.id == material.idProdComponenteId,
    );
    if (!product) {
      return {
        success: false,
        status: 404,
        message: "Producto no encontrado",
      };
    }
    const totalMaterialQuantity =
      material.quantity * productionOrder.cantidadProductoFabricado;
    product.existenciaReservada =
      product.existenciaReservada - totalMaterialQuantity;

    revertChanges.push(product);
  }
  return { success: true, query: ProductsRepository.save(revertChanges) };
};

export const GetProductionOrdersController = async (
  req: GetProductsOrdersListReq,
  res: ResponseAPI,
) => {
  try {
    const {
      limit,
      offset,
      endDate,
      product,
      realEndDate,
      startDate,
      orderState,
    } = req.query;

    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<ProductionOrders> = {};

    if (product && product.length > 0) {
      whereClause.product = { nombre: Like(`%${product}%`) };
    }
    if (endDate && endDate.length > 0) {
      whereClause.endDate = Equal(new Date(endDate));
    }
    if (realEndDate && realEndDate.length > 0) {
      whereClause.realEndDate = Equal(new Date(realEndDate));
    }
    if (startDate && startDate.length > 0) {
      whereClause.startDate = Equal(new Date(startDate));
    }
    if (orderState && orderState.length > 0) {
      const validOrderStates = Object.values(OrderState);
      if (!validOrderStates.includes(orderState as OrderState)) {
        return res.status(400).json({
          status: false,
          message: `orderState inválido. Los valores válidos son: ${validOrderStates.join(", ")}`,
        });
      }
      whereClause.orderState = orderState as OrderState;
    }

    const options: FindManyOptions<ProductionOrders> = {
      take,
      skip,
      select: {
        id: true,
        product: { nombre: true, id: true, codigo: true, measureUnit: true },
        cantidadProductoFabricado: true,
        orderState: true,
        startDate: true,
        endDate: true,
        realEndDate: true,
        responsables: true,
        create_at: true,
      },
      relations: {
        product: true,
      },
      where: whereClause,
      order: {
        create_at: "desc",
      },
    };

    const [productionOrders, total] =
      await ProductionOrdersRepository.findAndCount(options);
    res.status(200).json({
      status: true,
      data: { productionOrders, total },
      message: "Ordenes de producción obtenidas exitosamente",
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

export const CreateProductionOrderController = async (
  req: CreateUpdateProductsOrdersReq,
  res: ResponseAPI,
) => {
  try {
    if (!req.body) {
      res.status(422).json({
        status: false,
        message:
          "No se proporcionaron datos para modificar el estado de la orden",
      });
      return;
    }

    const { cantidadProductoFabricado, endDate, product, responsables } =
      req.body;

    const productEntity = await getProductWithRelations(Number(product.id));

    if (!productEntity) {
      res.status(404).json({
        status: false,
        message: "Producto no encontrado",
      });
      return;
    }

    const materialsChanges = [];

    const materialsListIds = productEntity.materialsList.map(
      (item) => item.idProdComponenteId,
    );

    const materialsList = await ProductsRepository.find({
      where: {
        id: In(materialsListIds),
      },
    });

    if (materialsListIds.length !== materialsList.length) {
      res.status(404).json({
        status: false,
        message:
          "Algunos materiales para la producción no existen en la base de datos",
      });
      return;
    }

    for (const material of productEntity.materialsList) {
      const product = materialsList.find(
        (item) => item.id == material.idProdComponenteId,
      );

      if (!product) {
        res.status(404).json({
          status: false,
          message: "Producto no encontrado",
        });
        return;
      }
      const newExistenciaReservada =
        product.existenciaReservada +
        material.quantity * cantidadProductoFabricado;
      if (newExistenciaReservada > product.existencia) {
        res.status(400).json({
          status: false,
          message: `El material ${product.codigo} - ${product.nombre} no tiene suficiente existencia disponible para crear ${productEntity.codigo} - ${productEntity.nombre}.`,
        });
        return;
      }
      product.existenciaReservada = newExistenciaReservada;
      materialsChanges.push(product);
    }

    const productionOrder = ProductionOrdersRepository.create({
      cantidadProductoFabricado,
      endDate,
      orderState: OrderState.PorIniciar,
      product,
      responsables,
    });

    await Promise.all([
      ProductsRepository.save(materialsChanges),
      ProductionOrdersRepository.save(productionOrder),
    ]);
    productionOrder.product = productEntity;

    res.status(201).json({
      status: true,
      data: productionOrder,
      message: "Orden de producción creada exitosamente",
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

export const UpdateProductionOrderController = async (
  req: CreateUpdateProductsOrdersReq,
  res: ResponseAPI,
) => {
  try {
    if (!req.body) {
      res.status(422).json({
        status: false,
        message:
          "No se proporcionaron datos para modificar el estado de la orden",
      });
      return;
    }

    const { id } = req.params;

    const productionOrder = await ProductionOrdersRepository.findOne({
      where: { id: Number(id) },
      relations: {
        product: {
          materialsList: {
            idProdComponente: true,
          },
        },
      },
    });

    if (!productionOrder) {
      res.status(404).json({
        status: false,
        message: "Orden de producción no encontrada",
      });
      return;
    }
    if (productionOrder.orderState !== OrderState.PorIniciar) {
      res.status(400).json({
        status: false,
        message:
          "No se puede actualizar una orden de producción ya inicializada, finalizada o cancelada",
      });
      return;
    }

    const { cantidadProductoFabricado, endDate, responsables } = req.body;

    const materialsChanges = [];
    if (
      cantidadProductoFabricado != productionOrder.cantidadProductoFabricado
    ) {
      const materialsListIds = productionOrder.product.materialsList.map(
        (item) => item.idProdComponente.id,
      );

      const materialsList = await ProductsRepository.find({
        where: {
          id: In(materialsListIds),
        },
      });

      if (materialsListIds.length !== materialsList.length) {
        res.status(404).json({
          status: false,
          message:
            "Algunos materiales para la producción no existen en la base de datos",
        });
        return;
      }

      for (const material of productionOrder.product.materialsList) {
        const product = materialsList.find(
          (item) => item.id == material.idProdComponente.id,
        );
        if (!product) {
          res.status(404).json({
            status: false,
            message: "Producto no encontrado",
          });
          return;
        }

        const oldQuantityToReserve =
          material.quantity * productionOrder.cantidadProductoFabricado;
        const newQuantityToReserve =
          material.quantity * cantidadProductoFabricado;

        const existenciaReservadaBefore =
          product.existenciaReservada - oldQuantityToReserve;

        const newExistenciaReservada =
          existenciaReservadaBefore + newQuantityToReserve;

        if (newExistenciaReservada > product.existencia) {
          res.status(400).json({
            status: false,
            message:
              "No se pudo actualizar. Los materiales requeridos para crear el producto ya están ocupados. Intente con una cantidad para producción menor",
          });
          return;
        }
        product.existenciaReservada = newExistenciaReservada;
        materialsChanges.push(product);
      }
    }

    Object.assign(productionOrder, {
      cantidadProductoFabricado,
      endDate,
      responsables,
    });

    await ProductionOrdersRepository.save(productionOrder);
    if (materialsChanges.length > 0) {
      await ProductsRepository.save(materialsChanges);
    }

    res.status(200).json({
      status: true,
      data: productionOrder,
      message: "Orden de producción actualizada exitosamente",
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

export const ChangeProductionOrderStatusController = async (
  req: ChangeOrderStateReq,
  res: ResponseAPI,
) => {
  try {
    if (!req.body) {
      res.status(422).json({
        status: false,
        message:
          "No se proporcionaron datos para modificar el estado de la orden",
      });
      return;
    }

    const { id } = req.params;
    const { orderStateEnum } = req.body;

    const productionOrder = await ProductionOrdersRepository.findOne({
      where: { id: Number(id) },
      select: {
        id: true,
        endDate: true,
        orderState: true,
        cantidadProductoFabricado: true,
        product: {
          id: true,
          codigo: true,
          nombre: true,
          measureUnit: true,
          materialsList: {
            idProdComponenteId: true,
            idProdComponente: true,
            quantity: true,
          },
        },
      },
      relations: {
        product: {
          materialsList: {
            idProdComponente: true,
          },
        },
      },
    });

    if (!productionOrder) {
      res.status(404).json({
        status: false,
        message: "Orden de producción no encontrada",
      });
      return;
    }

    const databaseQueries = [];

    switch (orderStateEnum) {
      case OrderState.EnProceso: {
        if (productionOrder.orderState !== OrderState.PorIniciar) {
          res.status(400).json({
            status: false,
            message:
              "No se puede modificar el estado de la orden a En Proceso si no está por iniciar",
          });
          return;
        }
        productionOrder.startDate = new Date();
        break;
      }
      case OrderState.PorIniciar: {
        res.status(400).json({
          status: false,
          message: "No se puede modificar el estado de la order a por iniciar",
        });
        return;
      }
      case OrderState.Cancelada: {
        if (productionOrder.orderState !== OrderState.PorIniciar) {
          res.status(400).json({
            status: false,
            message:
              "No se puede modificar el estado de la orden a Cancelada si no está por iniciar",
          });
          return;
        }

        const resultCancel =
          await processProductionOrderCancel(productionOrder);
        if (!resultCancel.success) {
          res.status(resultCancel.status).json({
            message: resultCancel.message,
            status: false,
          });
          return;
        }
        databaseQueries.push(resultCancel.query);

        break;
      }
      case OrderState.Ejecutada: {
        if (productionOrder.orderState !== OrderState.EnProceso) {
          res.status(400).json({
            status: false,
            message:
              "No se puede modificar el estado de la orden a Ejecutada si no está en proceso",
          });
          return;
        }

        const result = await processProductionOrderCompletion(productionOrder);
        if (!result.success) {
          res.status(result.status).json({
            status: false,
            message: result.message,
          });
          return;
        }

        databaseQueries.push(...result.queries);
        productionOrder.realEndDate = new Date();
        break;
      }
      default: {
        res.status(400).json({
          status: false,
          message: "Hay un error en el estado de la orden proporcionado",
        });
        return;
      }
    }

    productionOrder.orderState = orderStateEnum;

    databaseQueries.push(ProductionOrdersRepository.save(productionOrder));
    await Promise.all(databaseQueries);
    res.status(200).json({
      status: true,
      data: productionOrder,
      message: "Orden de producción actualizada exitosamente",
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
