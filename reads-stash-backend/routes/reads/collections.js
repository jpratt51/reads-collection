"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const ReadCollection = require("../../models/reads/collection");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createReadCollectionSchema = require("../../schemas/createReadCollection.json");
const ExpressError = require("../../expressError");

router.get(
    "/:readId/collections/:collectionId",
    async function getOneReadCollection(req, res, next) {
        try {
            const { readId, collectionId } = req.params;
            const readCollection = await ReadCollection.getById(
                readId,
                collectionId
            );
            console.log(readCollection);
            return res.status(200).json(readCollection);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:readId/collections",
    ensureLoggedIn,
    async function createReadCollection(req, res, next) {
        try {
            const validator = jsonschema.validate(
                req.body,
                createReadCollectionSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
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
    ensureLoggedIn,
    async function deleteReadCollection(req, res, next) {
        try {
            const { readId, collectionId } = req.params;
            const readCollection = await ReadCollection.getById(
                readId,
                collectionId
            );
            await readCollection.delete();
            return res.status(200).json({
                msg: `Deleted read ${readId} from collection ${collectionId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
