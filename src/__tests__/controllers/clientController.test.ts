import type { Express } from "express";
import type { DataSource } from "typeorm";
import type { Client } from "@/database/entities/Client";
import type { Users } from "@/database/entities/Users";
import type { GetClientsResponse } from "@/typescript/client";
import type { ResponseI } from "@/typescript/express";

import { agent } from "supertest";

import { GlobalRepository } from "@/database/repositories/globalRepository";
import { createToken } from "@/controllers/AuthController";
import { buildDatabase, createClients, seedDatabase } from "../helpers";
import { validationClientErrors } from "../validationErrors";

const BaseRoute = "/api/v1.0";

interface bodyClientI {
  nombreContacto: string;
  nombreEmpresa: string;
  empresaTelefono: string;
  emailEmpresa: string;
  emailContacto: string;
  ciRif: string;
  direccionFiscal: string;
}

describe("Client controler", () => {
  let user: Users;
  let token: string;
  let dataSource: DataSource | undefined;
  let app: Express;

  beforeAll(async () => {
    dataSource = await buildDatabase();
    const res = await seedDatabase();
    if (res) {
      user = res.user;
      token = createToken(user);
    }
  });

  beforeEach(async () => {
    const imported = await import("../../app");
    app = imported.default as Express;
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  describe("Create client", () => {
    it("Should return 201 and the client created", async () => {
      const response = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send({
          nombreContacto: "Luis",
          nombreEmpresa: "Inme",
          empresaTelefono: "04141234567",
          emailEmpresa: "gabotdev@gmail.com",
          emailContacto: "inme@gmail.com",
          ciRif: "V12345678",
          direccionFiscal: "Carvajal, La Cejita",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining<Partial<ResponseI>>({
          status: true,
          data: expect.objectContaining({
            id: expect.any(Number) as number,
            nombreContacto: "Luis",
            nombreEmpresa: "Inme",
            empresaTelefono: "04141234567",
            emailEmpresa: "gabotdev@gmail.com",
            emailContacto: "inme@gmail.com",
            ciRif: "V12345678",
            direccionFiscal: "Carvajal, La Cejita",
          }) as Partial<Client>,
          message: "Cliente creado exitosamente!",
        }),
      );
    });
    it("Should return 422 when data is not provided", async () => {
      const response = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .send();
      expect(response.status).toBe(422);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: false,
          message: "No se proporcionaron datos en el cuerpo de solicitud",
        }),
      );
    });

    it("Should return 401 when token is wrong", async () => {
      const response = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer aaaa`)
        .set("content-type", "application/json")
        .send({});
      expect(response.status).toBe(401);
    });

    it("Should return 403 when token is not provided", async () => {
      const response = await agent(app).post(`${BaseRoute}/client`).send({});
      expect(response.status).toBe(403);
    });

    it("Should return 409 when trying to create a client with the same CI or RIF", async () => {
      const response = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send({
          nombreContacto: "Luis",
          nombreEmpresa: "Inme",
          empresaTelefono: "04141234567",
          emailEmpresa: "gabotdev@gmail.com",
          emailContacto: "inme@gmail.com",
          ciRif: "V12345679",
          direccionFiscal: "Carvajal, La Cejita",
        });

      expect(response.status).toBe(201);

      const secondResponse = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send({
          nombreContacto: "Luis",
          nombreEmpresa: "Inme",
          empresaTelefono: "04141234567",
          emailEmpresa: "gabotdev@gmail.com",
          emailContacto: "inme@gmail.com",
          ciRif: "V12345679",
          direccionFiscal: "Carvajal, La Cejita",
        });
      expect(secondResponse.status).toBe(409);
    });

    for (const {
      error: errorMessage,
      value,
      field,
      title,
    } of validationClientErrors) {
      it(title, async () => {
        const body = {
          nombreContacto: "Luis",
          nombreEmpresa: "Inme",
          empresaTelefono: "04141234567",
          emailEmpresa: "gabotdev@gmail.com",
          emailContacto: "inme@gmail.com",
          ciRif: "V12345678",
          direccionFiscal: "Carvajal, La Cejita",
          [field]: value,
        };

        const response = await agent(app)
          .post(`${BaseRoute}/client`)
          .set("Authorization", `Bearer ${token}`)
          .set("content-type", "application/json")
          .send(body);

        expect(response.status).toEqual(422);
        expect(response.body).toEqual(
          expect.objectContaining<Partial<ResponseI>>({
            status: false,
            message: expect.arrayContaining([errorMessage]) as string[],
          }) as Partial<ResponseI>,
        );
      });
    }
  });

  describe("Get clients", () => {
    beforeEach(async () => {
      await GlobalRepository.clientRepository.query("DELETE FROM client");
    });

    it("Should return 200 and a list of clients", async () => {
      await createClients(1);
      const response = await agent(app)
        .get(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining<Partial<ResponseI>>({
          status: true,
          data: expect.objectContaining({
            total: expect.any(Number) as number,
            clients: expect.arrayContaining<Partial<Client>[]>([
              expect.objectContaining<Partial<Client>>({
                id: expect.any(Number) as number,
                nombreContacto: expect.any(String) as string,
                nombreEmpresa: expect.any(String) as string,
                empresaTelefono: expect.any(String) as string,
                emailEmpresa: expect.any(String) as string,
                emailContacto: expect.any(String) as string,
                ciRif: expect.any(String) as string,
                direccionFiscal: expect.any(String) as string,
              }),
            ]) as Partial<Client>[],
          }),
          message: "Clientes obtenidos exitosamente",
        }) as Partial<ResponseI>,
      );
    });
    it("Should return only a client with a specified name", async () => {
      await createClients(3, "AcmeInc");

      const res = await agent(app)
        .get(`${BaseRoute}/client?nombreEmpresa=AcmeInc-0`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      const resBody = res.body as ResponseI<GetClientsResponse>;

      expect(resBody.data?.clients.length).toBe(1);
      expect(resBody.data?.clients[0].nombreEmpresa).toBe("AcmeInc-0");
    });

    it("Should return more than the default limit of 10 clients", async () => {
      await createClients(15);

      const res = await agent(app)
        .get(`${BaseRoute}/client?limit=20`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      const resBody = res.body as ResponseI<GetClientsResponse>;

      expect(resBody.data?.clients.length).toBeGreaterThan(10);
    });

    it("Should return less than the default limit of 10 clients", async () => {
      await createClients(5);

      const res = await agent(app)
        .get(`${BaseRoute}/client?limit=5`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);

      const resBody = res.body as ResponseI<GetClientsResponse>;

      expect(resBody.data?.clients.length).toBeLessThanOrEqual(5);
    });

    it("Should return the default limit of 10 clients", async () => {
      await createClients(30);

      const res = await agent(app)
        .get(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);

      const resBody = res.body as ResponseI<GetClientsResponse>;

      expect(resBody.data?.clients.length).toBeLessThanOrEqual(10);
    });

    it("Should skip X quantity of clients", async () => {
      await createClients(15);

      const res1 = await agent(app)
        .get(`${BaseRoute}/client?limit=5`)
        .set("Authorization", `Bearer ${token}`);
      const res2 = await agent(app)
        .get(`${BaseRoute}/client?limit=5&offset=5`)
        .set("Authorization", `Bearer ${token}`);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      const resBody1 = res1.body as ResponseI<GetClientsResponse>;
      const resBody2 = res2.body as ResponseI<GetClientsResponse>;

      expect(resBody1.data?.clients[0].ciRif).not.toBe(
        resBody2.data?.clients[0].ciRif,
      );
    });
  });

  describe("Update client", () => {
    let body: bodyClientI;
    beforeEach(() => {
      body = {
        nombreContacto: "Luis",
        nombreEmpresa: "Inme",
        empresaTelefono: "04141234567",
        emailEmpresa: "gabotdev@gmail.com",
        emailContacto: "inme@gmail.com",
        ciRif: "V12345123",
        direccionFiscal: "Carvajal, La Cejita",
      };
    });

    it("Should return 200 and the client updated", async () => {
      const nombreContacto = "Luis Changed";

      const response = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(body);
      expect(response.status).toEqual(201);

      const clientId = (response.body as ResponseI<Client>).data?.id;
      const updateResponse = await agent(app)
        .put(`${BaseRoute}/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send({ ...body, nombreContacto });
      expect(updateResponse.status).toEqual(200);
      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          status: true,
          data: expect.objectContaining<Partial<Client>>({
            id: clientId,
            nombreContacto,
            nombreEmpresa: body.nombreEmpresa,
            empresaTelefono: body.empresaTelefono,
            emailEmpresa: body.emailEmpresa,
            emailContacto: body.emailContacto,
            ciRif: body.ciRif,
            direccionFiscal: body.direccionFiscal,
          }) as Partial<Client>[],
          message: "Cliente actualizado exitosamente",
        }) as Partial<ResponseI>,
      );
    });

    it("Should return 400 if the parameter in uri is wrong", async () => {
      const response = await agent(app)
        .put(`${BaseRoute}/client/aaaa`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(body);
      expect(response.status).toBe(400);
    });
    it("Should return 404 if the client does not exist", async () => {
      const response = await agent(app)
        .put(`${BaseRoute}/client/100`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(body);
      expect(response.status).toBe(404);
    });

    it("Should return 401 when token is wrong", async () => {
      const response = await agent(app)
        .put(`${BaseRoute}/client/1`)
        .set("Authorization", `Bearer aaaa`)
        .set("content-type", "application/json")
        .send({});
      expect(response.status).toBe(401);
    });

    it("Should return 403 when token is not provided", async () => {
      const response = await agent(app).put(`${BaseRoute}/client/1`).send({});
      expect(response.status).toBe(403);
    });
    it("Should return 409 when trying to update a client with the same CI or RIF", async () => {
      const firstBody = {
        ...body,
        ciRif: "V12345670",
      };
      const secondBody = {
        ...body,
        ciRif: "V12345671",
      };
      const responseOne = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(firstBody);
      const responseTwo = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(secondBody);

      expect(responseOne.status).toBe(201);
      expect(responseTwo.status).toBe(201);

      const clientId = (responseTwo.body as ResponseI<Client>).data?.id;

      const updateResponseFailure = await agent(app)
        .put(`${BaseRoute}/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(firstBody);
      expect(updateResponseFailure.status).toBe(409);
    });

    for (const {
      error: errorMessage,
      value,
      field,
      title,
    } of validationClientErrors) {
      it(title, async () => {
        Object.assign(body, { [field]: value });

        const response = await agent(app)
          .put(`${BaseRoute}/client/1`)
          .set("Authorization", `Bearer ${token}`)
          .set("content-type", "application/json")
          .send(body);

        expect(response.status).toEqual(422);
        expect(response.body).toEqual(
          expect.objectContaining({
            status: false,
            message: expect.arrayContaining([errorMessage]) as string[],
          }) as Partial<Client>,
        );
      });
    }
  });

  describe("Get client by ID", () => {
    it("Get client by ID", async () => {
      const body = {
        nombreContacto: "Luis",
        nombreEmpresa: "Inme",
        empresaTelefono: "04141234567",
        emailEmpresa: "gabotdev@gmail.com",
        emailContacto: "inme@gmail.com",
        ciRif: "V2341233",
        direccionFiscal: "Carvajal, La Cejita",
      };
      const response = await agent(app)
        .post(`${BaseRoute}/client`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json")
        .send(body);
      expect(response.status).toEqual(201);
      const clientId = (response.body as ResponseI<Client>).data?.id;
      const responseGet = await agent(app)
        .get(`${BaseRoute}/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json");
      expect(responseGet.status).toEqual(200);
      expect(responseGet.body).toEqual(
        expect.objectContaining({
          status: true,
          data: expect.objectContaining<Partial<Client>>({
            id: clientId,
            nombreContacto: body.nombreContacto,
            nombreEmpresa: body.nombreEmpresa,
            empresaTelefono: body.empresaTelefono,
            emailEmpresa: body.emailEmpresa,
            emailContacto: body.emailContacto,
            ciRif: body.ciRif,
            direccionFiscal: body.direccionFiscal,
          }) as Partial<Client>,
          message: "Cliente obtenido exitosamente",
        }),
      );
    });

    it("Should return 400 if the parameter in uri is wrong", async () => {
      const response = await agent(app)
        .get(`${BaseRoute}/client/aaaa`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json");
      expect(response.status).toBe(400);
    });
    it("Should return 404 if the client does not exist", async () => {
      const response = await agent(app)
        .get(`${BaseRoute}/client/100`)
        .set("Authorization", `Bearer ${token}`)
        .set("content-type", "application/json");
      expect(response.status).toBe(404);
    });

    it("Should return 401 when token is wrong", async () => {
      const response = await agent(app)
        .get(`${BaseRoute}/client/1`)
        .set("Authorization", `Bearer aaaa`)
        .set("content-type", "application/json");
      expect(response.status).toBe(401);
    });

    it("Should return 403 when token is not provided", async () => {
      const response = await agent(app).get(`${BaseRoute}/client/1`).send({});
      expect(response.status).toBe(403);
    });
  });
});
