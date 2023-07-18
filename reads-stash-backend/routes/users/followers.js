"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserFollower = require("../../models/users/follower");
const { ensureLoggedIn } = require("../../middleware/auth");

router.get(
    "/:userId/followers",
    ensureLoggedIn,
    async function getAllUserFollowers(req, res, next) {
        try {
            const { userId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other Users Followers",
                    403
                );
                return next(invalidUser);
            }
            let followers = await UserFollower.getAll(userId);
            return res.status(200).json(followers);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/followers/:followerId",
    ensureLoggedIn,
    async function getOneUserFollower(req, res, next) {
        try {
            const { userId, followerId } = req.params;
            if (req.user.id != userId) {
                const invalidUser = new ExpressError(
                    "Cannot View Other Users Followers",
                    403
                );
                return next(invalidUser);
            }
            let follower = await UserFollower.getById(userId, followerId);
            return res.status(200).json(follower);
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
