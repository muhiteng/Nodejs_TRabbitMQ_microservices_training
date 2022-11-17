"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var PORT = 8000;
var app = express();
app.use(cors({
    origin: ["http://localhost:3000"],
}));
app.use(express.json());
app.listen(PORT, function () { return console.log("server running on port ".concat(PORT)); });
