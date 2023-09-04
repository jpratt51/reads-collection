"use strict";

const db = require("../../db");
const ExpressError = require("../../expressError");
const { checkForUser } = require("../../helpers/checkUser");

class UserJournal {
    constructor(id, title, date, text, username) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.text = text;
        this.username = username;
    }

    static async getAll(username) {
        const results = await db.query(
            `SELECT id, title, date, text, user_username AS username FROM journals WHERE user_username = $1;`,
            [username]
        );
        const userJournals = results.rows.map(
            (j) => new UserJournal(j.id, j.title, j.date, j.text, j.username)
        );
        return userJournals;
    }

    static async getById(username, journalId) {
        if (/^\d+$/.test(journalId) === false)
            throw new ExpressError(`Invalid journal id data type`, 400);
        const results = await db.query(
            `SELECT id, title, date, text, user_username FROM journals WHERE id = $1 AND user_username = $2;`,
            [journalId, username]
        );
        const j = results.rows[0];
        if (!j) {
            throw new ExpressError(`User's journal ${journalId} not found`);
        }
        return new UserJournal(j.id, j.title, j.date, j.text, j.user_username);
    }

    static async create(title, date, text, username) {
        const userCheck = await checkForUser(username);
        if (userCheck) return userCheck;
        const results = await db.query(
            "INSERT INTO journals (title, date, text, user_username) VALUES ($1, $2, $3, $4) RETURNING id, title, date, text, user_username AS username",
            [title, date, text, username]
        );
        const j = results.rows[0];

        return new UserJournal(j.id, j.title, j.date, j.text, j.username);
    }

    async update() {
        await db.query(
            `UPDATE journals
                    SET title = $1,
                    text = $2
                    WHERE id = $3 AND user_username = $4
                    RETURNING id, title, date, text, user_username AS username`,
            [this.title, this.text, this.id, this.username]
        );
    }

    async delete(username) {
        await db.query(
            "DELETE FROM journals WHERE id = $1 AND user_username = $2;",
            [this.id, username]
        );
    }
}

module.exports = UserJournal;
