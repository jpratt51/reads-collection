"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.post("/", async function createReadCollection(req, res, next) {
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
});

router.delete("/:collection_id", function deleteReadCollection(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock delete read collection request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
