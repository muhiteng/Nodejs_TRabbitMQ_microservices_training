import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { AppDataSource } from "./entity/data-source";
import { Product } from "./entity/product";

const PORT = 8000;

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(async (db) => {
    // here you can start to work with your database
    const app = express();
    app.use(express.json());
    app.use(cors({ origins: ["http://localhost:3000"] }));
    app.listen(PORT, () => {
      console.log(`Server working on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
