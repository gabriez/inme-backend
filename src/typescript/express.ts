import type { Request, Response } from "express";
import type { ParamsDictionary, Send, Query } from "express-serve-static-core";
import type { Users } from "../database/entities/Users";
import { Client } from "@/database/entities/Client";
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

export interface ResponseAPI<T = unknown>
	extends TypedResponse<{
		data?: T;
		status: boolean;
		message: string[] | string;
	}> {}

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
