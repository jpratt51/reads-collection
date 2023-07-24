"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const ReadCollection = require("../../models/reads/collection");
const { ensureLoggedIn } = require("../../middleware/auth");
const { checkUserIdMatchesLoggedInUser } = require("../../helpers/checkUser");
const checkForValidInputs = require("../../helpers/inputsValidation");
const jsonschema = require("jsonschema");
const createReadCollectionSchema = require("../../schemas/createReadCollection.json");
const ExpressError = require("../../expressError");

router.get(
    "/:readId/collections",
    ensureLoggedIn,
    async function getAllReadsCollections(req, res, next) {
        try {
            const { userId } = req.body;
            const { readId } = req.params;
            checkUserIdMatchesLoggedInUser(userId, req.user.id);
            const readCollection = await ReadCollection.getAll(userId, readId);
            return res.json(readCollection);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:readId/collections/:collectionId",
    ensureLoggedIn,
    async function getOneReadsCollection(req, res, next) {
        try {
            const { readId, collectionId } = req.params;
            const { userId } = req.body;
            checkUserIdMatchesLoggedInUser(userId, req.user.id);
            const readCollection = await ReadCollection.getById(
                userId,
                readId,
                collectionId
            );
            return res.json(readCollection);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:readId/collections",
    ensureLoggedIn,
    async function createReadsCollection(req, res, next) {
        try {
            const { readId } = req.params;
            const { userId } = req.body;
            checkUserIdMatchesLoggedInUser(userId, req.user.id);
            let inputs = {};
            inputs["readId"] = +readId;
            inputs["collectionId"] = req.body.collectionId;
            const validator = jsonschema.validate(
                inputs,
                createReadCollectionSchema
            );
            checkForValidInputs(validator);
            const collection = await ReadCollection.create(inputs);
            return res.status(201).json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:readId/collections/:collectionId",
    ensureLoggedIn,
    async function deleteReadsCollection(req, res, next) {
        try {
            const { readId, collectionId } = req.params;
            const { userId } = req.body;
            checkUserIdMatchesLoggedInUser(userId, req.user.id);
            const readCollection = await ReadCollection.getById(
                userId,
                readId,
                collectionId
            );
            console.log("readCollection", readCollection);
            await readCollection.delete();
            return res.json({
                msg: `Deleted Read ${readId} Association With Collection ${collectionId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
