import { User } from './user.entity';
import { DataSource } from "typeorm";
import { Product } from "./product";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "node_admin_db",
  entities: [Product,User],
  synchronize: true,
  logging: true,
});
