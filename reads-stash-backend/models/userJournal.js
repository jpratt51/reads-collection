"use strict";

const db = require("../db");

class UserJournal {
    constructor(id, title, date, text, user_id) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.text = text;
        this.user_id = user_id;
    }

    static async getAll(user_id) {
        const results = await db.query(
            `SELECT * FROM journals WHERE user_id = $1;`,
            [user_id]
        );
        const journals = results.rows.map(
            (r) => new UserJournal(r.id, r.title, r.date, r.text, r.user_id)
        );
        return journals;
    }
}

module.exports = UserJournal;
