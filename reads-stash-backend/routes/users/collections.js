"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserCollection = require("../../models/users/collection");

router.get(
    "/:userId/collections",
    async function getAllUserCollections(req, res, next) {
        try {
            const { userId } = req.params;
            const collections = await UserCollection.getAll(userId);
            return res.status(200).json(collections);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/collections/:collectionId",
    async function getOneUserCollection(req, res, next) {
        try {
            const { userId, collectionId } = req.params;
            const collection = await UserCollection.getById(
                userId,
                collectionId
            );
            return res.status(200).json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/collections",
    async function createUserCollection(req, res, next) {
        try {
            const { name, userId } = req.body;
            const collection = await UserCollection.create(name, userId);
            return res.status(201).json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.patch(
    "/:userId/collections/:collectionId",
    async function updateUserCollection(req, res, next) {
        try {
            const { userId, collectionId } = req.params;
            const { name } = req.body;
            const collection = await UserCollection.getById(
                userId,
                collectionId
            );
            name ? (collection.name = name) : null;
            await collection.update();
            return res.status(200).json(collection);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/collections/:collectionId",
    async function deleteUserCollection(req, res, next) {
        try {
            const { userId, collectionId } = req.params;
            const userCollection = await UserCollection.getById(
                userId,
                collectionId
            );
            await userCollection.delete(userId);
            return res
                .status(200)
                .json({ msg: `Deleted user collection ${collectionId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
