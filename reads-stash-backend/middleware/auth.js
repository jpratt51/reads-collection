const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../config");

function authenticateJWT(req, res, next) {
    try {
        const payload = jwt.verify(req.headers._token, SECRET_KEY);
        req.user = payload;
        return next();
    } catch (error) {
        next();
    }
}

module.exports = { authenticateJWT };
