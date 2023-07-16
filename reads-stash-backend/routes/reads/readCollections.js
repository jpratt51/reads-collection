"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.post(
    "/:readId/collections",
    async function createReadCollection(req, res, next) {
        try {
            const { readId, collectionId } = req.body;
            const results = await db.query(
                "INSERT INTO reads_collections (read_id, collection_id) VALUES ($1, $2) RETURNING * ;",
                [readId, collectionId]
            );
            return res.status(201).json(results.rows);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:readId/collections/:collectionId",
    async function deleteReadCollection(req, res, next) {
        try {
            const { readId, collectionId } = req.params;
            await db.query(
                "DELETE FROM reads_collections WHERE read_id = $1 AND collection_id = $2;",
                [readId, collectionId]
            );
            return res.status(200).json({
                msg: `Deleted read ${readId} from collection ${collectionId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
