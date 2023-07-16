"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const ReadCollection = require("../../models/reads/collection");

router.post(
    "/:readId/collections",
    async function createReadCollection(req, res, next) {
        try {
            const { readId } = req.params;
            const { collectionId } = req.body;
            const collection = await ReadCollection.create(
                readId,
                collectionId
            );
            return res.status(201).json(collection);
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
