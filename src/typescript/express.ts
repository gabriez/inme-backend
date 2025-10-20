import type { Request, Response } from "express";
import type { ParamsDictionary, Query, Send } from "express-serve-static-core";
import type { Client } from "@/database/entities/Client";
import type { HistorialAction } from "@/database/entities/Historial";
import type { OrderState } from "@/database/entities/ProductionOrders";
import type { ProductType } from "@/database/entities/Products";
import type { Providers } from "@/database/entities/Providers";
import type { Users } from "../database/entities/Users";
export interface TypedResponse<ResBody> extends Response {
  json: Send<ResBody, this>;
}

export interface RequestAPI<T = {}, P extends ParamsDictionary = {}, Q = {}>
  extends Request {
  body: T | undefined;
  params: P;
  user?: Users | null;
  query: Q & Query;
}

export interface ResponseI<T = unknown> {
  data?: T;
  status: boolean;
  message: string[] | string;
}

export interface ResponseAPI<T = unknown> extends TypedResponse<ResponseI<T>> {}

/* AuthController */
export interface IsignUpReq extends RequestAPI<Users> {}

export interface IsignInReq
  extends RequestAPI<{
    username?: string;
    email?: string;
    password?: string;
  }> {}

export interface IdParamReq extends RequestAPI<{}, { id: string }> {}

// Clients req

export interface CreateUpdateClientReq
  extends RequestAPI<Client, { id: string }> {}

export interface GetClientsListReq
  extends RequestAPI<
    {},
    {},
    {
      limit: string;
      offset: string;
      nombreEmpresa: string;
    }
  > {}

// Providers
export interface CreateUpdateProvidersReq
  extends RequestAPI<Providers, { id: string }> {}

export interface GetProvidersListReq
  extends RequestAPI<
    {},
    {},
    {
      limit: string;
      offset: string;
      enterpriseName: string;
    }
  > {}

// Products req

export interface ProductsReq {
  codigo: string;
  nombre: string;
  existencia: number;
  measureUnit: string;
  planos: string;
  productType: ProductType;
  materialsList: {
    id: number;
    quantity: number;
  }[];
  providersList: {
    id: number;
  }[];
  providers: Providers[];
}

export interface UpdateProductExistenceI {
  quantity: number;
  description: string;
  action: string; // it should accept only keyof typeof HistorialAction. This value comes from frontend and will be parsed into HistorialAction
  actionEnum: HistorialAction;
  provider?: { id: number };
  client?: { id: number };
}

export interface CreateUpdateProductsReq
  extends RequestAPI<ProductsReq, { id: string }> {}

export interface GetProductsListReq
  extends RequestAPI<
    {},
    {},
    {
      limit: string;
      offset: string;
      codigo: string;
      nombre: string;
      productType: string;
    }
  > {}

export interface UpdateProductExistenceReq
  extends RequestAPI<UpdateProductExistenceI, { id: string }> {}

// Production orders

export interface ProductsOrdersI {
  cantidadProductoFabricado: number;
  endDate: Date;
  responsables: string;
  product: { id: number };
}

export interface CreateUpdateProductsOrdersReq
  extends RequestAPI<ProductsOrdersI, { id: string }> {}

export interface GetProductsOrdersListReq
  extends RequestAPI<
    {},
    {},
    {
      limit: string;
      offset: string;
      product: string;
      endDate: string;
      realEndDate: string;
      startDate: string;
      orderState: string;
    }
  > {}

export interface ChangeOrderStateReq
  extends RequestAPI<
    { orderState: string; orderStateEnum: OrderState },
    { id: string }
  > {}

// Historial
export interface GetHistorialReq
  extends RequestAPI<
    {},
    {},
    {
      limit: string;
      offset: string;
      action: string;
      provider: string;
      client: string;
      product: string;
      productionOrder: string;
      endDate: string;
      startDate: string;
    }
  > {}

// Users
export interface UpdateUser {
  email: string;
  rol: {
    id: number;
  };
  name: string;
  password: string;
  updatePassword: boolean;
}

export interface CreateUserReq
  extends RequestAPI<{
    name: string;
    email: string;
    username: string;
    password: string;
    rol: {
      id: number;
    };
  }> {}

export interface UpdateUserReq extends RequestAPI<UpdateUser, { id: string }> {}
export interface GetUsersReq
  extends RequestAPI<
    {},
    {},
    {
      limit: string;
      offset: string;
      username: string;
      email: string;
      rol: string;
      nombre: string;
    }
  > {}
