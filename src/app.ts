import type { Request, Response } from "express";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { PORT_APP, ROOT_DIRECTORY } from "./constants";
import { routes } from "./routes";

// initializations
const app = express();

// settings
app.set("port", PORT_APP ?? 3030);

// middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from ROOT_DIRECTORY
if (ROOT_DIRECTORY) {
  app.use("/uploads", express.static(ROOT_DIRECTORY));
}

// routes
routes(app);

app.all("/status", (req: Request, res: Response) => {
  res.json({
    status: true,
    message: "Active and running server!",
  });
});

app.all("/*rest", (req: Request, res: Response) => {
  res.status(404).json({
    error: "404 - requested resource not found",
  });
});

export default app;
