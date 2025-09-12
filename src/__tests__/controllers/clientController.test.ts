import type { Express } from "express";
import type { DataSource } from "typeorm";
import type { Users } from "@/database/entities/Users";

import { agent } from "supertest";

import { createToken } from "@/controllers/AuthController";
import { buildDatabase, seedDatabase } from "../helpers";

const BaseRoute = "/api/v1.0";

describe("Client controler", () => {
  let fakeUser: Users;
  let token: string;
  let dataSource: DataSource | undefined;
  let app: Express;
  beforeEach(async () => {
    dataSource = await buildDatabase();
    const res = await seedDatabase();
    if (res) {
      fakeUser = res.user;
      token = createToken(fakeUser);
    }
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
        expect.objectContaining({
          status: true,
          data: expect.objectContaining({
            id: expect(Number),
            nombreContacto: "Luis",
            nombreEmpresa: "Inme",
            empresaTelefono: "04141234567",
            emailEmpresa: "gabotdev@gmail.com",
            emailContacto: "inme@gmail.com",
            ciRif: "V12345678",
            direccionFiscal: "Carvajal, La Cejita",
          }) as unknown,
          message: "Cliente creado exitosamente!",
        }),
      );
    });
  });
});
