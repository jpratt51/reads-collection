"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const Read = require("../../models/reads/read");

router.get("/", async function getAllReads(req, res, next) {
    try {
        const reads = await Read.getAll();
        return res.status(200).json(reads);
    } catch (error) {
        return next(error);
    }
});

router.get("/:readId", async function getOneRead(req, res, next) {
    try {
        const { readId } = req.params;
        const results = await db.query(`SELECT * FROM reads WHERE id = $1;`, [
            readId,
        ]);
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.post("/", async function createRead(req, res, next) {
    try {
        const {
            thumbnail,
            title,
            description,
            isbn,
            averageRating,
            printType,
            publisher,
        } = req.body;
        const results = await db.query(
            "INSERT INTO reads (thumbnail, title, description, isbn, average_rating, print_type, publisher) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ;",
            [
                thumbnail,
                title,
                description,
                isbn,
                averageRating,
                printType,
                publisher,
            ]
        );
        return res.status(201).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
