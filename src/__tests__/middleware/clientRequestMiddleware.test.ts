import type { NextFunction } from "express";
import type { Client } from "@/database/entities/Client";
import type { CreateUpdateClientReq, ResponseAPI } from "@/typescript/express";

import { validateClientMiddleware } from "@/middlewares/validations/clientRequest";
import { validationClientErrors } from "../validationErrors";

describe("Client request middleware", () => {
  let mockReq: Partial<CreateUpdateClientReq>;
  let mockRes: Partial<ResponseAPI>;
  let nextFunction: NextFunction = jest.fn();
  let body: Client;
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // By default, the body will be valid
    body = {
      nombreContacto: "Luis",
      nombreEmpresa: "Inme",
      empresaTelefono: "04141234567",
      emailEmpresa: "gabotdev@gmail.com",
      emailContacto: "inme@gmail.com",
      ciRif: "V123456789",
      direccionFiscal: "Carvajal, La Cejita",
      id: 0,
      create_at: new Date(),
      updated_at: new Date(),
      deleted_at: new Date(),
      hasId: function (): boolean {
        throw new Error("Function not implemented.");
      },
      save: function (): Promise<Client> {
        throw new Error("Function not implemented.");
      },
      remove: function (): Promise<Client> {
        throw new Error("Function not implemented.");
      },
      softRemove: function (): Promise<Client> {
        throw new Error("Function not implemented.");
      },
      recover: function (): Promise<Client> {
        throw new Error("Function not implemented.");
      },
      reload: function (): Promise<void> {
        throw new Error("Function not implemented.");
      },
    };
    mockReq = {};
    nextFunction = jest.fn();
  });

  it("Should call next one time if body is valid", () => {
    mockReq = {
      body,
    };
    validateClientMiddleware(
      mockReq as CreateUpdateClientReq,
      mockRes as ResponseAPI,
      nextFunction,
    );
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it("Should return 422 if no body is provided", () => {
    mockReq = {};
    validateClientMiddleware(
      mockReq as CreateUpdateClientReq,
      mockRes as ResponseAPI,
      nextFunction,
    );

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: false,
      message: "No se proporcionaron datos en el cuerpo de solicitud",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  for (const {
    error: errorMessage,
    value,
    field,
    title,
  } of validationClientErrors) {
    it(title, () => {
      Object.assign(body, { [field]: value });
      mockReq = {
        body,
      };

      validateClientMiddleware(
        mockReq as CreateUpdateClientReq,
        mockRes as ResponseAPI,
        nextFunction,
      );

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: false,
          message: expect.arrayContaining([errorMessage]) as string[],
        }),
      );
    });
  }
});
