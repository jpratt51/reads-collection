"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserCollection = require("../../models/users/collection");
const { ensureLoggedIn } = require("../../middleware/auth");
const jsonschema = require("jsonschema");
const createUserCollectionSchema = require("../../schemas/createUserCollection.json");
const updateUserCollectionSchema = require("../../schemas/updateUserCollection.json");
const ExpressError = require("../../expressError");

router.get(
    "/:userId/collections",
    ensureLoggedIn,
    async function getAllUserCollections(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Collections",
                    403
                );
                return next(invalidUser);
            }
            const collections = await UserCollection.getAll(userId);
            return res.json(collections);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/collections/:collectionId",
    ensureLoggedIn,
    async function getOneUserCollection(req, res, next) {
        try {
            const { userId, collectionId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Collections",
                    403
                );
                return next(invalidUser);
            }
            const collection = await UserCollection.getById(
                userId,
                collectionId
            );
            return res.json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/collections",
    ensureLoggedIn,
    async function createUserCollection(req, res, next) {
        try {
            const { name, userId } = req.body;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Collections",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                req.body,
                createUserCollectionSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const collection = await UserCollection.create(name, userId);
            return res.status(201).json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId/collections/:collectionId",
    ensureLoggedIn,
    async function updateUserCollection(req, res, next) {
        try {
            const { userId, collectionId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Collections",
                    403
                );
                return next(invalidUser);
            }
            const validator = jsonschema.validate(
                req.body,
                updateUserCollectionSchema
            );
            if (!validator.valid) {
                const listOfErrors = validator.errors.map((e) => e.stack);
                const errors = new ExpressError(listOfErrors, 400);
                return next(errors);
            }
            const { name } = req.body;
            const collection = await UserCollection.getById(
                userId,
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
    "/:userId/collections/:collectionId",
    ensureLoggedIn,
    async function deleteUserCollection(req, res, next) {
        try {
            const { userId, collectionId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Collections",
                    403
                );
                return next(invalidUser);
            }
            const userCollection = await UserCollection.getById(
                userId,
                collectionId
            );
            await userCollection.delete(userId);
            return res.json({ msg: `Deleted user collection ${collectionId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
