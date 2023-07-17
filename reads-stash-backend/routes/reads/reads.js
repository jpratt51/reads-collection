"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const Read = require("../../models/reads/read");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createReadSchema = require("../../schemas/createRead.json");
const ExpressError = require("../../expressError");

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
        const validator = jsonschema.validate(req.body, createReadSchema);
        if (!validator.valid) {
            const listOfErrors = validator.errors.map((e) => e.stack);
            const errors = new ExpressError(listOfErrors, 400);
            return next(errors);
        }
        const { title, description, isbn, avgRating, printType, publisher } =
            req.body;
        const validInputs = {
            title,
            description: description || null,
            isbn,
            avgRating: avgRating || null,
            printType: printType || null,
            publisher: publisher || null,
        };
        const read = await Read.create(req.body);
        return res.status(201).json(read);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
