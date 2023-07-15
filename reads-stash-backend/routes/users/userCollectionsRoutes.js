"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get(
    "/:user_id/collections",
    async function getAllUserCollections(req, res, next) {
        try {
            const { user_id } = req.params;
            const results = await db.query(
                `SELECT * FROM collections WHERE user_id = $1;`,
                [user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:user_id/collections/:collection_id",
    async function getOneUserCollection(req, res, next) {
        try {
            const { user_id, collection_id } = req.params;
            const results = await db.query(
                `SELECT * FROM collections WHERE id = $1 AND user_id = $2;`,
                [collection_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:user_id/collections",
    async function createUserCollection(req, res, next) {
        try {
            const { name, user_id } = req.body;
            const results = await db.query(
                "INSERT INTO collections (name, user_id) VALUES ($1, $2) RETURNING * ;",
                [name, user_id]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:user_id/collections/:collection_id",
    async function updateUserCollection(req, res, next) {
        try {
            const { user_id, collection_id } = req.params;
            const { name } = req.body;
            const results = await db.query(
                `UPDATE collections SET name = $1 
                WHERE id = $2 AND user_id = $3 
                RETURNING *;`,
                [name, collection_id, user_id]
            );
            return res.status(200).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:user_id/collections/:collection_id",
    async function deleteUserCollection(req, res, next) {
        try {
            const { user_id, collection_id } = req.params;
            await db.query(
                "DELETE FROM collections WHERE id = $1 AND user_id = $2;",
                [collection_id, user_id]
            );
            return res
                .status(200)
                .json({ msg: `Deleted user collection ${collection_id}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
