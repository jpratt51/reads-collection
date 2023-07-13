"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", async function getAllReads(req, res, next) {
    try {
        const results = await db.query("SELECT * FROM reads;");
        return res.status(200).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

router.get("/:read_id", function getOneRead(req, res, next) {
    try {
        return res.status(200).json({ msg: "Mock get one read request" });
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
            average_rating,
            print_type,
            publisher,
        } = req.body;
        const results = await db.query(
            "INSERT INTO reads (thumbnail, title, description, isbn, average_rating, print_type, publisher) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ;",
            [
                thumbnail,
                title,
                description,
                isbn,
                average_rating,
                print_type,
                publisher,
            ]
        );
        return res.status(201).json(results.rows);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
