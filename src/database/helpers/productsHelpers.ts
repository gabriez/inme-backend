import { GlobalRepository } from "../repositories/globalRepository";

const ProductsRepository = GlobalRepository.productsRepository;

export const getProductWithRelations = async (id: number) => {
  return ProductsRepository.findOne({
    where: { id },
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
        idProdComponenteId: true,
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
  });
};
