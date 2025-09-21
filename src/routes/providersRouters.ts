import { Router } from "express";

import {
  CreateProvidersController,
  GetProvidersController,
} from "@/controllers/ProvidersController";
import { verifyToken } from "@/middlewares/authJWT";
import { providersRequestMiddleware } from "@/middlewares/validations/providersRequestMiddleware";

export const providersRouters = () => {
  const routerRoot = Router();
  routerRoot
    .route("/")
    .get(verifyToken, GetProvidersController)
    .post([verifyToken, providersRequestMiddleware], CreateProvidersController);
  return routerRoot;
};
