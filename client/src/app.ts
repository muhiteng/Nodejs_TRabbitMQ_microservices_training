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

import axios from "axios";
const PORT = 8001;

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
        conn.createChannel((err, ch2) => {
          if (err) throw err;
          ch2.assertQueue(queue);
          ch2.assertQueue(createProductQueue);
          ch2.assertQueue(updateProductQueue);
          ch2.assertQueue(deleteProductQueue);

          // Rabbitmq listener test
          ch2.consume(queue, (msg) => {
            if (msg !== null) {
              console.log(msg.content.toString());
              ch2.ack(msg);
            } else {
              console.log("Consumer cancelled by server");
            }
          });

          ch2.consume(createProductQueue, async (msg) => {
            if (msg !== null) {
              const eventProduct: Product = JSON.parse(msg.content.toString());

              const product = new Product();
              product.admin_id = parseInt(eventProduct.id);
              product.title = eventProduct.title;
              product.image = eventProduct.image;
              product.likes = eventProduct.likes;

              await productRepository.save(product);

              console.log("product created");
              ch2.ack(msg);
            } else {
              console.log("Consumer cancelled by server");
            }
          });

          ch2.consume(updateProductQueue, async (msg) => {
            if (msg !== null) {
              const eventProduct: Product = JSON.parse(msg.content.toString());

              const product = await productRepository.findOneBy({
                admin_id: parseInt(eventProduct.id),
              });
              productRepository.merge(product, {
                title: eventProduct.title,
                image: eventProduct.image,
                likes: eventProduct.likes,
              });
              await productRepository.save(product);
              console.log("product updated");
              ch2.ack(msg);
            } else {
              console.log("Consumer cancelled by server");
            }
          });

          ch2.consume(deleteProductQueue, async (msg) => {
            if (msg !== null) {
              const eventProduct: Product = JSON.parse(msg.content.toString());

              const admin_id = parseInt(msg.content.toString());
              await productRepository.delete({ admin_id });
              console.log("product deleted");
              ch2.ack(msg);
            } else {
              console.log("Consumer cancelled by server");
            }
          });

          const app = express();
          app.use(express.json());

          app.use(cors({ origins: ["http://localhost:3000"] }));

          // Repositories
          const productRepository = AppDataSource.getRepository(Product);
          // routes
          app.get("/api/products", async (req: Request, res: Response) => {
            const products = await productRepository.find();
            return res.send(products);
          });

          app.post(
            "/api/products/:id/like",
            async (req: Request, res: Response) => {
              const product = await productRepository.findOneBy({
                id: req.params.id,
              });
              await axios.post(
                `http://localhost:8000/api/products/${product.admin_id}/like`,
                {}
              );
              product.likes++;
              await productRepository.save(product);
              return res.send(product);
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
