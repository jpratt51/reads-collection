"use strict";

const db = require("../db");
const ExpressError = require("../expressError");

async function checkForUser(username) {
    const userCheck = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );
    if (userCheck.rows.length === 0) {
        throw new ExpressError("User Not Found", 404);
    }
}

function checkUsernameMatchesLoggedInUser(username, loggedInUsername) {
    if (loggedInUsername != username) {
        throw new ExpressError("Incorrect Username", 403);
    }
}

module.exports = { checkForUser, checkUsernameMatchesLoggedInUser };
