"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserCollection = require("../../models/users/userCollection");

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
            const results = await db.query(
                `SELECT * FROM collections WHERE id = $1 AND user_id = $2;`,
                [collectionId, userId]
            );
            return res.status(200).json(results.rows);
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
            const results = await db.query(
                "INSERT INTO collections (name, user_id) VALUES ($1, $2) RETURNING * ;",
                [name, userId]
            );
            return res.status(201).json(results.rows);
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
            const results = await db.query(
                `UPDATE collections SET name = $1 
                WHERE id = $2 AND user_id = $3 
                RETURNING *;`,
                [name, collectionId, userId]
            );
            return res.status(200).json(results.rows);
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
            await db.query(
                "DELETE FROM collections WHERE id = $1 AND user_id = $2;",
                [collectionId, userId]
            );
            return res
                .status(200)
                .json({ msg: `Deleted user collection ${collectionId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
