import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { AppDataSource } from "./entity/data-source";
import { Product } from "./entity/product";
const amqplib = require("amqplib/callback_api");
const queue = "products";
const createProductQueue = "createProduct";
const updateProductQueue = "updateProduct";
const deleteProductQueue = "deleteProduct";

const PORT = 8000;

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(async (db) => {
    // here you can start to work with your database

    amqplib.connect(
      "amqps://kiubzbaf:SzQ8y_I46ITK_aLw1O9nIKNn3pNEmacU@woodpecker.rmq.cloudamqp.com/kiubzbaf",
      (err, conn) => {
        if (err) throw err;
        conn.createChannel((err, ch) => {
          if (err) throw err;
          const app = express();
          app.use(express.json());

          app.use(cors({ origins: ["http://localhost:3000"] }));

          // Repositories
          const productRepository = AppDataSource.getRepository(Product);
          // routes
          app.get("/api/products", async (req: Request, res: Response) => {
            const products = await productRepository.find();

            // rabbitmq sender test
            ch.assertQueue(queue);
            ch.sendToQueue(queue, Buffer.from("sended products"));

            res.status(200).json(products);
          });

          app.post("/api/products", async (req: Request, res: Response) => {
            const product = await productRepository.create(req.body);
            const result = await productRepository.save(product);

            // rabbitmq sender
            ch.assertQueue(createProductQueue);
            ch.sendToQueue(
              createProductQueue,
              Buffer.from(JSON.stringify(result))
            );

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

            // rabbitmq sender
            ch.assertQueue(updateProductQueue);
            ch.sendToQueue(
              updateProductQueue,
              Buffer.from(JSON.stringify(result))
            );
            return res.send(result);
          });

          app.delete(
            "/api/products/:id",
            async (req: Request, res: Response) => {
              const result = await productRepository.delete(req.params.id);

              // rabbitmq sender
              ch.assertQueue(deleteProductQueue);
              ch.sendToQueue(deleteProductQueue, Buffer.from(req.params.id));

              return res.send(result);
            }
          );

          app.post(
            "/api/products/:id/like",
            async (req: Request, res: Response) => {
              const product = await productRepository.findOneBy({
                id: req.params.id,
              });
              product.likes++;

              const result = await productRepository.save(product);
              return res.send(result);
            }
          );

          app.listen(PORT, () => {
            console.log(`Server working on port ${PORT}`);
          });
          process.on("beforeExit", () => {
            console.log("closing rabbitMq conection");
            conn.close();
          });
        });
      }
    );
  })
  .catch((error) => console.log(error));
