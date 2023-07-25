"use strict";

const express = require("express");
const router = new express.Router();
const Read = require("../../models/reads/read");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createReadSchema = require("../../schemas/createRead.json");
const ExpressError = require("../../expressError");

router.get("/", async function getAllReads(req, res, next) {
    try {
        const reads = await Read.getAll();
        return res.json(reads);
    } catch (error) {
        return next(error);
    }
});

router.get("/:readId", async function getOneRead(req, res, next) {
    try {
        const { readId } = req.params;
        const read = await Read.getById(readId);
        return res.json(read);
    } catch (error) {
        return next(error);
    }
});

router.post("/", ensureLoggedIn, async function createRead(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, createReadSchema);
        if (!validator.valid) {
            const listOfErrors = validator.errors.map((e) => e.stack);
            const errors = new ExpressError(listOfErrors, 400);
            return next(errors);
        }
        const {
            title,
            description,
            isbn,
            avgRating,
            printType,
            publisher,
            thumbnail,
            authors,
        } = req.body;
        const validInputs = {};
        validInputs["title"] = title;
        validInputs["isbn"] = isbn;
        description ? (validInputs["description"] = description) : null;
        avgRating ? (validInputs["avg_rating"] = avgRating) : null;
        printType ? (validInputs["print_type"] = printType) : null;
        publisher ? (validInputs["publisher"] = publisher) : null;
        thumbnail ? (validInputs["thumbnail"] = thumbnail) : null;

        const read = await Read.create(validInputs, authors);
        return res.status(201).json(read);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
