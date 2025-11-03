import type { Request, Response } from "express";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { CORS, PORT_APP, ROOT_DIRECTORY } from "./constants";
import { routes } from "./routes";

// initializations
const app = express();

// settings
app.set("port", PORT_APP ?? 3030);

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!CORS) {
        callback(new Error("CORS not defined"), false);
        return;
      }
      if (!origin) {
        callback(null, false);
        return;
      }
      const urls = CORS.split(",");

      if (urls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from ROOT_DIRECTORY
app.use("/uploads", express.static(ROOT_DIRECTORY));

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
