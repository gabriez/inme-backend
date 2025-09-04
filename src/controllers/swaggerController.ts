import type { Request, RequestHandler, Response } from "express";

import swaggerJSDoc, { Options } from "swagger-jsdoc";
import SwaggerUI from "swagger-ui-express";

import { PORT_APP } from "../constants";

const options: Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "API Documentation",
			version: "1.0.0",
			description: "API documentation for the INME system",
		},
		servers: [
			{
				url: `http://localhost:${PORT_APP ? Number(PORT_APP) : 3030}`,
				description: "Server Local",
			},
		],
	},
	apis: ["src/docs/**/*.ts", "src/routes/**/*.ts"],
};

//Docs in JSON format
export const Docs: RequestHandler = SwaggerUI.setup(swaggerJSDoc(options));

export const DocsJSON = (req: Request, res: Response) => {
	res.setHeader("Content-Type", "application/json");
	res.send(swaggerJSDoc(options));
};
