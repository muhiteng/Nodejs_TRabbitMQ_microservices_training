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

    // Repositories
    const productRepository = AppDataSource.getRepository(Product);
    // routes
    app.get("/api/products", async (req: Request, res: Response) => {
      const products = await productRepository.find();

      res.status(200).json(products);
    });

    app.post("/api/products", async (req: Request, res: Response) => {
      const product = await productRepository.create(req.body);
      const result = await productRepository.save(product);
      return res.send(result);
    });

    app.get("/api/products/:id", async (req: Request, res: Response) => {
      const product = await productRepository.findOneBy({
        id: req.params.id,
      });
      return res.send(product);
    });

    app.put("/api/products/:id", async (req: Request, res: Response) => {
      const product = await productRepository.findOneBy({
        id: req.params.id,
      });
      productRepository.merge(product, req.body);
      const result = await productRepository.save(product);

      return res.send(result);
    });

    app.delete("/api/products/:id", async (req: Request, res: Response) => {
      const result = await productRepository.delete(req.params.id);

      return res.send(result);
    });

    app.post("/api/products/:id/like", async (req: Request, res: Response) => {
      const product = await productRepository.findOneBy({
        id: req.params.id,
      });
      product.likes++;
      const result = await productRepository.save(product);
      return res.send(result);
    });

    app.listen(PORT, () => {
      console.log(`Server working on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
