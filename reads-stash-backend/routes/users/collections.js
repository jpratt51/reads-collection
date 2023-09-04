"use strict";

const express = require("express");
const router = new express.Router();
const UserCollection = require("../../models/users/collection");
const { ensureLoggedIn } = require("../../middleware/auth");
const checkForValidInputs = require("../../helpers/inputsValidation");
const { checkUsernameMatchesLoggedInUser } = require("../../helpers/checkUser");
const jsonschema = require("jsonschema");
const createUserCollectionSchema = require("../../schemas/createUserCollection.json");
const updateUserCollectionSchema = require("../../schemas/updateUserCollection.json");

router.get(
    "/:username/collections",
    ensureLoggedIn,
    async function getAllUserCollections(req, res, next) {
        try {
            const { username } = req.params;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const collections = await UserCollection.getAll(username);
            return res.json(collections);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:username/collections/:collectionId",
    ensureLoggedIn,
    async function getOneUserCollection(req, res, next) {
        try {
            const { username, collectionId } = req.params;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const collection = await UserCollection.getById(
                username,
                collectionId
            );
            return res.json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:username/collections",
    ensureLoggedIn,
    async function createUserCollection(req, res, next) {
        try {
            const { name } = req.body;
            const { username } = req.params;
            let inputs = {};
            inputs["name"] = name;
            inputs["user_username"] = username;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const validator = jsonschema.validate(
                inputs,
                createUserCollectionSchema
            );
            checkForValidInputs(validator);
            const collection = await UserCollection.create(name, username);
            return res.status(201).json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:username/collections/:collectionId",
    ensureLoggedIn,
    async function updateUserCollection(req, res, next) {
        try {
            const { username, collectionId } = req.params;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const validator = jsonschema.validate(
                req.body,
                updateUserCollectionSchema
            );
            checkForValidInputs(validator);
            const { name } = req.body;
            const collection = await UserCollection.getById(
                username,
                collectionId
            );
            name ? (collection.name = name) : null;
            await collection.update();
            return res.json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:username/collections/:collectionId",
    ensureLoggedIn,
    async function deleteUserCollection(req, res, next) {
        try {
            const { username, collectionId } = req.params;
            checkUsernameMatchesLoggedInUser(username, req.user.username);
            const userCollection = await UserCollection.getById(
                username,
                collectionId
            );
            await userCollection.delete(username);
            return res.json({ msg: `Deleted User Collection ${collectionId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
