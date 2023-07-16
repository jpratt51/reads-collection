"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserFollowed = require("../../models/users/followed");

router.get(
    "/:userId/followed",
    async function getAllUserFollowed(req, res, next) {
        try {
            const { userId } = req.params;
            let followed = await UserFollowed.getAll(userId);
            return res.status(200).json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/followed/:followedId",
    async function getOneUserFollowed(req, res, next) {
        try {
            const { userId, followedId } = req.params;
            let followed = await UserFollowed.getById(userId, followedId);
            return res.status(200).json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.post(
    "/:userId/followed",
    async function createUserFollowed(req, res, next) {
        try {
            const { followedId, userId } = req.body;
            const followed = await UserFollowed.create(followedId, userId);
            return res.status(201).json(followed);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId/followed/:followedId",
    async function deleteUserFollowed(req, res, next) {
        try {
            const { userId, followedId } = req.params;
            await db.query(
                "DELETE FROM users_followed WHERE followed_id = $1 AND user_id = $2;",
                [followedId, userId]
            );
            return res.status(200).json({
                msg: `User ${userId} stopped following user ${followedId}`,
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
