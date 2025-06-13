import type { Request, Response } from 'express';
import type { ParamsDictionary, Send } from 'express-serve-static-core';
import type { Users } from '../database/entities/Users';
export interface TypedResponse<ResBody> extends Response {
	json: Send<ResBody, this>;
}

export interface RequestAPI<T = {}, P extends ParamsDictionary = {}> extends Request {
	body: T | undefined;
	params: P;
	user?: Users | null;
}

export interface ResponseAPI<T = unknown>
	extends TypedResponse<{
		data?: T;
		status: boolean;
		message: string;
	}> {}

/* AuthController */
export interface IsignUpReq extends RequestAPI<Users> {}

export interface IsignInReq
	extends RequestAPI<{
		username?: string;
		password?: string;
	}> {}
