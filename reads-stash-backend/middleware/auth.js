"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

function authenticateJWT(req, res, next) {
    try {
        const payload = jwt.verify(req.headers._token, SECRET_KEY);
        req.user = payload;
        return next();
    } catch (error) {
        next();
    }
}

function ensureLoggedIn(req, res, next) {
    try {
        if (!req.user) {
            const error = new ExpressError("Unauthorized", 401);
            return next(error);
        }
        return next();
    } catch (error) {}
}

module.exports = { authenticateJWT, ensureLoggedIn };
