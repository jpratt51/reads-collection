"use strict";

const express = require("express");
const router = new express.Router();
const ReadCollection = require("../../models/reads/collection");
const { ensureLoggedIn } = require("../../middleware/auth");
const { checkUsernameMatchesLoggedInUser } = require("../../helpers/checkUser");
const checkForValidInputs = require("../../helpers/inputsValidation");
const jsonschema = require("jsonschema");
const createReadCollectionSchema = require("../../schemas/createReadCollection.json");

router.get(
    "/:isbn/collections",
    ensureLoggedIn,
    async function getAllReadsCollections(req, res, next) {
        try {
            const { username } = req.body;
            const { isbn } = req.params;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const readCollection = await ReadCollection.getAll(username, isbn);
            return res.json(readCollection);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:isbn/collections/:collectionId",
    ensureLoggedIn,
    async function getOneReadsCollection(req, res, next) {
        try {
            const { isbn, collectionId } = req.params;
            const { username } = req.body;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const readCollection = await ReadCollection.getById(
                username,
                isbn,
                collectionId
            );
            return res.json(readCollection);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:isbn/collections",
    ensureLoggedIn,
    async function createReadsCollection(req, res, next) {
        try {
            const { isbn } = req.params;
            const { username } = req.body;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            let inputs = {};
            inputs["isbn"] = isbn;
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
    "/:isbn/collections/:collectionId",
    ensureLoggedIn,
    async function deleteReadsCollection(req, res, next) {
        try {
            const { isbn, collectionId } = req.params;
            const { username } = req.body;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const readCollection = await ReadCollection.getById(
                username,
                isbn,
                collectionId
            );
            await readCollection.delete();
            return res.json({
                msg: `Deleted Read ${isbn} Association With Collection ${collectionId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
