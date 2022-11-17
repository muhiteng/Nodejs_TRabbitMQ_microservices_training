"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var user_entity_1 = require("./user.entity");
var typeorm_1 = require("typeorm");
var product_1 = require("./product");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "node_admin_db",
    entities: [product_1.Product, user_entity_1.User],
    synchronize: true,
    logging: true,
});
