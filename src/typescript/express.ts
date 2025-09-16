import type { Request, Response } from "express";
import type { ParamsDictionary, Query, Send } from "express-serve-static-core";
import type { Client } from "@/database/entities/Client";
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
