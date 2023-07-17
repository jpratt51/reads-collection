"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const Read = require("../../models/reads/read");
const { ensureLoggedIn } = require("../../middleware/auth");

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
        const read = await Read.getById(readId);
        return res.status(200).json(read);
    } catch (error) {
        return next(error);
    }
});

router.post("/", ensureLoggedIn, async function createRead(req, res, next) {
    try {
        const {
            thumbnail,
            title,
            description,
            isbn,
            avgRating,
            printType,
            publisher,
        } = req.body;
        const read = await Read.create(
            thumbnail,
            title,
            description,
            isbn,
            avgRating,
            printType,
            publisher
        );
        return res.status(201).json(read);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
