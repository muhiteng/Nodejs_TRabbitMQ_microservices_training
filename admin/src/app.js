"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var PORT = 8000;
var AppDataSource = new typeorm_1.DataSource({
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
    .then(function () {
    // here you can start to work with your database
    var app = express();
    app.use(express.json());
    app.use(cors({ origins: ["http://localhost:3000"] }));
    app.listen(PORT, function () {
        console.log("Server working on port ".concat(PORT));
    });
})
    .catch(function (error) { return console.log(error); });
