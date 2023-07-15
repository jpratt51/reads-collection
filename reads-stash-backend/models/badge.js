"use strict";

const db = require("../db");

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
}

module.exports = Badge;
