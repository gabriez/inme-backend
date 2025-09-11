import { agent } from "supertest";
import app from "../../app";
import { Client } from "@/database/entities/Client";
import { Users } from "@/database/entities/Users";
import { createToken } from "@/controllers/AuthController";

const BaseRoute = "/api/v1.0";

describe("Client controler", () => {
  let fakeUser = Users.create({
    password: "Ganador123$",
    username: "LuisCalvito",
    name: "Luis Mogollon",
    email: "inme@gmail.com",
  });
  let token = createToken(fakeUser);

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
          ciRif: "v12345678",
          direccionFiscal: "Carvajal",
        });

      console.log(response);
      expect(response.status).toBe(201);
    });
  });
});
