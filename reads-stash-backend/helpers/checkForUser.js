const db = require("../db");

async function checkForUser(userId) {
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [
        userId,
    ]);
    if (userCheck.rows.length === 0) return { message: "User not found" };
}

module.exports = { checkForUser };
