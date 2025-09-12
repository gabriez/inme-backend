import type { DataSource, DataSourceOptions } from "typeorm";

import { newDb } from "pg-mem";

import { Client } from "@/database/entities/Client";
import { Historial } from "@/database/entities/Historial";
import { ProductionOrders } from "@/database/entities/ProductionOrders";
import { Products } from "@/database/entities/Products";
import { Providers } from "@/database/entities/Providers";
import { Roles } from "@/database/entities/Roles";
import { Users } from "@/database/entities/Users";
import {
  buildRepositories,
  GlobalRepository,
} from "@/database/repositories/globalRepository";
export async function buildDatabase(): Promise<DataSource | undefined> {
  const db = newDb({
    // 👉 Recommended when using Typeorm .synchronize(), which creates foreign keys but not indices !
    autoCreateForeignKeyIndices: true,
  });

  db.public.registerFunction({
    implementation: () => "test",
    name: "version",
  });
  db.public.registerFunction({
    implementation: () => "test",
    name: "current_database",
  });
  try {
    const typeOrmConnection: DataSourceOptions = {
      type: "postgres",
      entities: [
        Roles,
        Users,
        Historial,
        Products,
        Providers,
        ProductionOrders,
        Client,
      ],
    } as DataSourceOptions;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataSource: DataSource =
      await db.adapters.createTypeormDataSource(typeOrmConnection);
    await dataSource.initialize();
    await dataSource.synchronize();
    buildRepositories(dataSource);
    return dataSource;
  } catch (error) {
    console.log(error);
  }
}

export async function seedDatabase() {
  const userRepository = GlobalRepository.userRepository;

  try {
    const user: Users = userRepository.create({
      password: "Ganador123$",
      username: "LuisCalvito",
      name: "Luis Mogollon",
      email: "inme@gmail.com",
    });
    await userRepository.save(user);
    return { user };
  } catch (error) {
    console.log(error);
  }
}
