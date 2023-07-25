"use strict";

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const PORT = +process.env.PORT || 3001;

module.exports = { SECRET_KEY, PORT };
