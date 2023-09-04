"use strict";

const db = require("../db");
const ExpressError = require("../expressError");

class Badge {
    constructor(id, name, thumbnail) {
        this.id = id;
        this.name = name;
        this.thumbnail = thumbnail;
    }

    static async getAll() {
        const results = await db.query("SELECT * FROM badges;");
        const badges = results.rows.map(
            (b) => new Badge(b.id, b.name, b.thumbnail)
        );
        return badges;
    }

    static async getByName(name) {
        const results = await db.query(`SELECT * FROM badges WHERE name = $1`, [
            name,
        ]);
        const b = results.rows[0];
        if (!b) {
            throw new ExpressError(`Badge ${name} Not Found`, 404);
        }
        return new Badge(b.id, b.name, b.thumbnail);
    }
}

module.exports = Badge;
