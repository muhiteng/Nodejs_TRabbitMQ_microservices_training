import * as express from "express";
import * as cors from "cors";

import { Product } from "./entity/product";
import { DataSource } from "typeorm";
const PORT = 8000;
const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "node_admin_db",
  entities: [__dirname + "src/entity/*.ts"],
  synchronize: true,
  logging: false,
});

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
    const app = express();
    app.use(express.json());
    app.use(cors({ origins: ["http://localhost:3000"] }));
    app.listen(PORT,()=>{console.log(`Server working on port ${PORT}`);
    })
  })
  .catch((error) => console.log(error));
