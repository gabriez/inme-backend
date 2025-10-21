import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { MaterialsList } from "@/database/entities/MaterialsList";
import type { Products } from "@/database/entities/Products";
import type {
  CreateUpdateProductsReq,
  GetProductsListReq,
  IdParamReq,
  RequestAPI,
  ResponseAPI,
  UpdateProductExistenceReq,
} from "@/typescript/express";

import { Like } from "typeorm";

import { HistorialAction } from "@/database/entities/Historial";
import { ProductType } from "@/database/entities/Products";
import { getProductWithRelations } from "@/database/helpers/productsHelpers";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const ProductsRepository = GlobalRepository.productsRepository;
const MaterialsListRepository = GlobalRepository.materialsListRepository;
const HistorialRepository = GlobalRepository.historialRepository;

export const GetProductsController = async (
  req: GetProductsListReq,
  res: ResponseAPI,
) => {
  try {
    const { limit, offset, codigo, nombre, productType } = req.query;

    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<Products> = {};

    if (codigo && codigo.length > 0) {
      whereClause.codigo = Like(`%${codigo}%`);
    }
    if (nombre && nombre.length > 0) {
      whereClause.nombre = Like(`%${nombre}%`);
    }
    if (productType && productType.length > 0) {
      const validProductTypes = Object.values(ProductType);
      if (!validProductTypes.includes(productType as ProductType)) {
        return res.status(400).json({
          status: false,
          message: `productType inválido. Los valores válidos son: ${validProductTypes.join(", ")}`,
        });
      }
      whereClause.productType = productType as ProductType;
    }

    const options: FindManyOptions<Products> = {
      take,
      skip,
      where: whereClause,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        productType: true,
        measureUnit: true,
        existenciaReservada: true,
        existencia: true,
        planos: true,
        materialsList: {
          id: true,
          quantity: true,
          idProdComponente: {
            id: true,
            nombre: true,
            codigo: true,
            measureUnit: true,
          },
        },
        providers: {
          id: true,
          enterpriseName: true,
        },
      },
      relations: {
        providers: true,
        materialsList: {
          idProdComponente: true,
        },
      },
    };

    const [products, total] = await ProductsRepository.findAndCount(options);
    console.log(products);
    res.status(200).json({
      status: true,
      data: { products, total },
      message: "Productos obtenidos exitosamente",
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
export const CreateProductsController = async (
  req: CreateUpdateProductsReq,
  res: ResponseAPI,
) => {
  try {
    const {
      codigo,
      materialsList = [],
      nombre,
      planos,
      productType,
      measureUnit,
      providers = [],
    } = req.body ?? {};

    const productByCode = await ProductsRepository.findOneBy({
      codigo,
    });
    if (productByCode) {
      res.status(409).json({
        status: false,
        message: "Ya existe un producto con el mismo codigo",
      });
      return;
    }
    const product = ProductsRepository.create({
      codigo,
      nombre,
      existencia: 0,
      planos,
      productType,
      measureUnit,
      existenciaReservada: 0,
      providers,
    });

    await ProductsRepository.save(product);
    const materialsListToCreate: MaterialsList[] = materialsList.map(
      (material) => {
        return MaterialsListRepository.create({
          quantity: material.quantity,
          idProdComponenteId: material.id,
          idProdCompuestoId: product.id,
        });
      },
    );

    await MaterialsListRepository.save(materialsListToCreate);

    const returnedProduct = await getProductWithRelations(product.id);

    res.status(200).json({
      status: true,
      data: returnedProduct,
      message: "Producto creado exitosamente",
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
export const GetProductByIdController = async (
  req: IdParamReq,
  res: ResponseAPI,
) => {
  try {
    const { id } = req.params;
    const product = await ProductsRepository.findOneBy({ id: Number(id) });
    if (!product) {
      res.status(404).json({
        status: false,
        message: "Producto no encontrado",
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: product,
      message: "Producto obtenido exitosamente",
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
export const UpdateProductController = async (
  req: CreateUpdateProductsReq,
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

    const product = await getProductWithRelations(Number(id));
    if (!product) {
      res.status(404).json({
        status: false,
        message: "Producto no encontrado",
      });
      return;
    }

    const {
      codigo,
      materialsList = [],
      nombre,
      planos,
      productType,
      measureUnit,
      providersList = [],
    } = req.body;

    const productByCode = await ProductsRepository.findOneBy({
      codigo,
    });
    if (productByCode && productByCode.id !== product.id) {
      res.status(409).json({
        status: false,
        message: "Ya existe un producto con el mismo codigo",
      });
      return;
    }

    Object.assign(product, {
      codigo,
      nombre,
      planos,
      productType,
      measureUnit,
      providers: providersList,
    });

    await ProductsRepository.save(product);

    const materialToCreate: MaterialsList[] = [];
    const materialToUpdate: MaterialsList[] = [];
    for (const materialBody of materialsList) {
      let materialExists = false;

      for (const material of product.materialsList) {
        if (material.idProdComponente.id === materialBody.id) {
          if (material.quantity !== materialBody.quantity) {
            Object.assign(material, materialBody);
            materialToUpdate.push(material);
            continue;
          }
          materialExists = true;
        }
      }

      if (!materialExists) {
        const materialCreated = MaterialsListRepository.create({
          idProdCompuesto: { id: Number(id) },
          idProdComponente: { id: materialBody.id },
          quantity: materialBody.quantity,
        });
        materialToCreate.push(materialCreated);
      }
    }

    const materialToDelete: MaterialsList[] = [];
    for (const material of product.materialsList) {
      if (!materialsList.some((m) => m.id === material.idProdComponente.id)) {
        materialToDelete.push(material);
      }
    }
    await MaterialsListRepository.remove(materialToDelete);
    await MaterialsListRepository.save(materialToCreate);
    await MaterialsListRepository.save(materialToUpdate);
    product.materialsList = [
      ...product.materialsList,
      ...materialToCreate,
      ...materialToUpdate,
    ];
    const productUpdated = await getProductWithRelations(Number(id));

    res.status(200).json({
      status: true,
      message: "Producto actualizado exitosamente",
      data: productUpdated,
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

export const DischargeProductsController = async (
  req: UpdateProductExistenceReq,
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

    const product = await ProductsRepository.findOneBy({ id: Number(id) });
    if (!product) {
      res.status(404).json({
        status: false,
        message: "Producto no encontrado",
      });
      return;
    }

    const { quantity, actionEnum, description, client } = req.body;

    const newQuantity = product.existencia - quantity;
    if (newQuantity < 0) {
      res.status(400).json({
        status: false,
        message: "No hay suficiente stock para descargar",
      });
      return;
    }

    if (
      actionEnum !== HistorialAction.EGRESO &&
      actionEnum !== HistorialAction.VENTA &&
      actionEnum !== HistorialAction.VARIOS
    ) {
      res.status(422).json({
        status: false,
        message: "Los valores para descargar deben ser VENTA, EGRESO O VARIOS",
      });
      return;
    }

    if (actionEnum === HistorialAction.VENTA && !client) {
      res.status(422).json({
        status: false,
        message: "No se puede registrar una venta sin un cliente",
      });
      return;
    }

    const story = HistorialRepository.create({
      action: actionEnum,
      cantidad: quantity,
      description,
      product,
      client: client ? { id: client.id } : undefined,
    });

    //TODO: descargar productos en historial
    product.existencia = newQuantity;
    await Promise.all([
      ProductsRepository.save(product),
      HistorialRepository.save(story),
    ]);
    res.status(200).json({
      status: true,
      message: "Producto descargado exitosamente",
      data: product,
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
export const ChargeProductsController = async (
  req: UpdateProductExistenceReq,
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

    const product = await ProductsRepository.findOneBy({ id: Number(id) });
    if (!product) {
      res.status(404).json({
        status: false,
        message: "Producto no encontrado",
      });
      return;
    }
    //TODO: cargar productos en historial

    const { quantity, actionEnum, description, provider } = req.body;
    console.log(actionEnum);
    if (
      actionEnum !== HistorialAction.INGRESO &&
      actionEnum !== HistorialAction.VARIOS
    ) {
      res.status(422).json({
        status: false,
        message: "Los valores para cargar deben ser INGRESO O VARIOS",
      });
      return;
    }
    const story = HistorialRepository.create({
      action: actionEnum,
      cantidad: quantity,
      description,
      product,
      provider: provider ? { id: provider.id } : undefined,
    });
    const newQuantity = product.existencia + quantity;

    product.existencia = newQuantity;
    await Promise.all([
      ProductsRepository.save(product),
      HistorialRepository.save(story),
    ]);
    res.status(200).json({
      status: true,
      message: "Producto cargado exitosamente",
      data: product,
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

export const GetChargeValidActions = (_req: RequestAPI, res: ResponseAPI) => {
  // Filtrar las acciones válidas que deseas enviar
  const validActions = Object.entries(HistorialAction).filter(([key]) =>
    ["INGRESO", "VARIOS"].includes(key),
  );

  res.status(200).json({
    message: "Acciones válidas para cargar productos obtenidas exitosamente",
    status: true,
    data: validActions,
  });
};

export const GetDischargeValidActions = (
  _req: RequestAPI,
  res: ResponseAPI,
) => {
  // Filtrar las acciones válidas que deseas enviar
  const validActions = Object.entries(HistorialAction).filter(([key]) =>
    ["EGRESO", "VENTA", "VARIOS"].includes(key),
  );

  res.status(200).json({
    message: "Acciones válidas para descargar productos obtenidas exitosamente",
    status: true,
    data: validActions,
  });
};
