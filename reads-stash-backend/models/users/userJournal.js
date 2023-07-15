"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");

class UserJournal {
    constructor(id, title, date, text, user_id) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.text = text;
        this.userId = user_id;
    }

    static async getAll(userId) {
        const results = await db.query(
            `SELECT * FROM journals WHERE user_id = $1;`,
            [userId]
        );
        const userJournals = results.rows.map(
            (j) => new UserJournal(j.id, j.title, j.date, j.text, j.user_id)
        );
        return userJournals;
    }

    static async getById(userId, journalId) {
        const results = await db.query(
            `SELECT * FROM journals WHERE id = $1 AND user_id = $2;`,
            [journalId, userId]
        );
        const j = results.rows[0];
        if (!j) {
            throw new ExpressError(`User's journal ${journalId} not found`);
        }
        return new UserJournal(j.id, j.title, j.date, j.text, j.user_id);
    }
}

module.exports = UserJournal;
