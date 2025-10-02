import type { Request, Response } from "express";
import type { ParamsDictionary, Query, Send } from "express-serve-static-core";
import type { Client } from "@/database/entities/Client";
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
}

export interface UpdateProductExistenceI {
  quantity: number;
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
