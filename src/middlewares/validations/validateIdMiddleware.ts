import type { Response } from "express";
import type { IdParamReq } from "../../typescript/express";

export function validateIdMiddleware(
  req: IdParamReq,
  res: Response,
  next: () => void,
) {
  const { id } = req.params;
  if (!id || Number.isNaN(Number(id))) {
    res.status(400).json({
      status: false,
      message: "El id proporcionado no es válido",
    });
    return;
  }
  next();
}
