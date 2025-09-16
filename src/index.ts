import type { Express } from "express";

import AppDataSource from "src/database/appDataSource";

import { buildRepositories } from "./database/repositories/globalRepository";

async function main() {
  try {
    await AppDataSource.initialize();
    buildRepositories(AppDataSource);

    // Importing app dynamically to ensure that all previous async operations are completed
    // ensuring GlobalRepository singleton is not undefined in other files
    const imported = await import("./app");
    const app = imported.default as Express;
    const port: number = app.get("port") as number;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

await main();
