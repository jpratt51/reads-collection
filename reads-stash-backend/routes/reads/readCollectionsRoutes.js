"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.post(
    "/:read_id/collections",
    async function createReadCollection(req, res, next) {
        try {
            const { read_id, collection_id } = req.body;
            const results = await db.query(
                "INSERT INTO reads_collections (read_id, collection_id) VALUES ($1, $2) RETURNING * ;",
                [read_id, collection_id]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:read_id/collections/:collection_id",
    async function deleteReadCollection(req, res, next) {
        try {
            const { read_id, collection_id } = req.params;
            await db.query(
                "DELETE FROM reads_collections WHERE read_id = $1 AND collection_id = $2;",
                [read_id, collection_id]
            );
            return res
                .status(200)
                .json({
                    msg: `Deleted read ${read_id} from collection ${collection_id}`,
                });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
