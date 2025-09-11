import AppDataSource from "src/database/appDataSource";
import { Users } from "src/database/entities/Users";
import app from "./app";
import { PORT_APP } from "./constants";

AppDataSource.initialize()
  .then(async () => {
    const port = app.get("port");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
