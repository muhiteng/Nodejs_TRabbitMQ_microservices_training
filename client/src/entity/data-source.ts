import { DataSource } from "typeorm";
import { Product } from "./product";

export const AppDataSource = new DataSource({
  type: "mongodb",
  host: "localhost",
  port: 27017,
  database: "node_client_db",
  entities: [Product],
  synchronize: true,
  logging: ["query", "error"],
  migrations: [],
  subscribers: [],
});
