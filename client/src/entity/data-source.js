"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
var product_1 = require("./product");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mongodb",
    host: "localhost",
    port: 27017,
    database: "node_client_db",
    entities: [product_1.Product],
    synchronize: true,
    logging: ["query", "error"],
    migrations: [],
    subscribers: [],
});
