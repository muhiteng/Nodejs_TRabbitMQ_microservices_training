"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var data_source_1 = require("./entity/data-source");
var product_1 = require("./entity/product");
var amqplib = require("amqplib/callback_api");
var queue = "products";
var createProductQueue = "createProduct";
var updateProductQueue = "updateProduct";
var deleteProductQueue = "deleteProduct";
var axios_1 = require("axios");
var PORT = 8001;
// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
data_source_1.AppDataSource.initialize()
    .then(function (db) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // here you can start to work with your database
        amqplib.connect("amqps://kiubzbaf:SzQ8y_I46ITK_aLw1O9nIKNn3pNEmacU@woodpecker.rmq.cloudamqp.com/kiubzbaf", function (err, conn) {
            if (err)
                throw err;
            conn.createChannel(function (err, ch2) {
                if (err)
                    throw err;
                ch2.assertQueue(queue);
                ch2.assertQueue(createProductQueue);
                ch2.assertQueue(updateProductQueue);
                ch2.assertQueue(deleteProductQueue);
                // Rabbitmq listener test
                ch2.consume(queue, function (msg) {
                    if (msg !== null) {
                        console.log(msg.content.toString());
                        ch2.ack(msg);
                    }
                    else {
                        console.log("Consumer cancelled by server");
                    }
                });
                ch2.consume(createProductQueue, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var eventProduct, product;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(msg !== null)) return [3 /*break*/, 2];
                                eventProduct = JSON.parse(msg.content.toString());
                                product = new product_1.Product();
                                product.admin_id = parseInt(eventProduct.id);
                                product.title = eventProduct.title;
                                product.image = eventProduct.image;
                                product.likes = eventProduct.likes;
                                return [4 /*yield*/, productRepository.save(product)];
                            case 1:
                                _a.sent();
                                console.log("product created");
                                ch2.ack(msg);
                                return [3 /*break*/, 3];
                            case 2:
                                console.log("Consumer cancelled by server");
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                ch2.consume(updateProductQueue, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var eventProduct, product;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(msg !== null)) return [3 /*break*/, 3];
                                eventProduct = JSON.parse(msg.content.toString());
                                return [4 /*yield*/, productRepository.findOneBy({
                                        admin_id: parseInt(eventProduct.id),
                                    })];
                            case 1:
                                product = _a.sent();
                                productRepository.merge(product, {
                                    title: eventProduct.title,
                                    image: eventProduct.image,
                                    likes: eventProduct.likes,
                                });
                                return [4 /*yield*/, productRepository.save(product)];
                            case 2:
                                _a.sent();
                                console.log("product updated");
                                ch2.ack(msg);
                                return [3 /*break*/, 4];
                            case 3:
                                console.log("Consumer cancelled by server");
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                ch2.consume(deleteProductQueue, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var eventProduct, admin_id;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(msg !== null)) return [3 /*break*/, 2];
                                eventProduct = JSON.parse(msg.content.toString());
                                admin_id = parseInt(msg.content.toString());
                                return [4 /*yield*/, productRepository.delete({ admin_id: admin_id })];
                            case 1:
                                _a.sent();
                                console.log("product deleted");
                                ch2.ack(msg);
                                return [3 /*break*/, 3];
                            case 2:
                                console.log("Consumer cancelled by server");
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                var app = express();
                app.use(express.json());
                app.use(cors({ origins: ["http://localhost:3000"] }));
                // Repositories
                var productRepository = data_source_1.AppDataSource.getRepository(product_1.Product);
                // routes
                app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var products;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRepository.find()];
                            case 1:
                                products = _a.sent();
                                return [2 /*return*/, res.send(products)];
                        }
                    });
                }); });
                app.post("/api/products/:id/like", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var product;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRepository.findOneBy({
                                    id: req.params.id,
                                })];
                            case 1:
                                product = _a.sent();
                                return [4 /*yield*/, axios_1.default.post("http://localhost:8000/api/products/".concat(product.admin_id, "/like"), {})];
                            case 2:
                                _a.sent();
                                product.likes++;
                                return [4 /*yield*/, productRepository.save(product)];
                            case 3:
                                _a.sent();
                                return [2 /*return*/, res.send(product)];
                        }
                    });
                }); });
                app.listen(PORT, function () {
                    console.log("Server working on port ".concat(PORT));
                });
                process.on("beforeExit", function () {
                    console.log("closing rabbitMq conection");
                    conn.close();
                });
            });
        });
        return [2 /*return*/];
    });
}); })
    .catch(function (error) { return console.log(error); });
