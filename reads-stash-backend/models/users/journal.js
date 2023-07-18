"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { checkForUser } = require("../../helpers/checkForUser");

class UserJournal {
    constructor(id, title, date, text, user_id) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.text = text;
        this.userId = user_id;
    }

    static async getAll(userId) {
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
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
        if (/^\d+$/.test(userId) === false)
            throw new ExpressError(`Invalid user id data type`, 400);
        if (/^\d+$/.test(journalId) === false)
            throw new ExpressError(`Invalid journal id data type`, 400);
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

    static async create(title, date, text, userId) {
        const userCheck = await checkForUser(userId);
        if (userCheck) return userCheck;
        const results = await db.query(
            "INSERT INTO journals (title, date, text, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, date, text, userId]
        );
        const j = results.rows[0];

        return new UserJournal(j.id, j.title, j.date, j.text, j.user_id);
    }

    async update() {
        await db.query(
            `UPDATE journals
                    SET title = $1,
                    text = $2
                    WHERE id = $3 AND user_id = $4
                    RETURNING *`,
            [this.title, this.text, this.id, this.user_id]
        );
    }

    async delete(userId) {
        await db.query("DELETE FROM journals WHERE id = $1 AND user_id = $2;", [
            this.id,
            userId,
        ]);
    }
}

module.exports = UserJournal;
