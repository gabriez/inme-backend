import { Router } from "express";

import { verifyToken } from "../middlewares/authJWT";
import {
	createClient,
	getClientById,
	getClients,
	updateClient,
} from "@/controllers/ClientController";
import { validateIdMiddleware } from "../middlewares/validations/validateIdMiddleware";
import { validateClient } from "../middlewares/validations/clientRequest";

export const clientRouters = () => {
	const routerRoot = Router();
	routerRoot
		.route("/")
		.get(verifyToken, getClients)
		.post([verifyToken, validateClient], createClient);
	routerRoot
		.route("/:id")
		.get([verifyToken, validateIdMiddleware], getClientById)
		.put([verifyToken, validateIdMiddleware, validateClient], updateClient);

	return routerRoot;
};
