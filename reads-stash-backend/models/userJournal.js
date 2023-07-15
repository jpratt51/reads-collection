"use strict";

const db = require("../db");

class UserJournal {
    constructor(id, title, date, text, userId) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.text = text;
        this.userId = userId;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM journals WHERE user_id = $1;`,
            [userId]
        );
        const userJournals = results.rows.map(
            (r) => new UserJournal(r.id, r.title, r.date, r.text, r.userId)
        );
        return userJournals;
    }
}

module.exports = UserJournal;
