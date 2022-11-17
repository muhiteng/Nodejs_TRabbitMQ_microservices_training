import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { AppDataSource } from "./entity/data-source";
import { Product } from "./entity/product";
const amqplib = require("amqplib/callback_api");
const queue = "products";

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

          // Rabbitmq listener
          ch2.consume(queue, (msg) => {
            if (msg !== null) {
              console.log(msg.content.toString());
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

          app.listen(PORT, () => {
            console.log(`Server working on port ${PORT}`);
          });
        });
      }
    );
  })
  .catch((error) => console.log(error));
