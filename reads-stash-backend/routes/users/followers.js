"use strict";

const express = require("express");
const router = new express.Router();
const UserFollower = require("../../models/users/follower");
const { ensureLoggedIn } = require("../../middleware/auth");
const ExpressError = require("../../expressError");

router.get(
    "/:username/followers",
    ensureLoggedIn,
    async function getAllUserFollowers(req, res, next) {
        try {
            const { username } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other User's Followers",
                    403
                );
                return next(invalidUser);
            }
            let followers = await UserFollower.getAll(username);
            return res.json(followers);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:username/followers/:followerUsername",
    ensureLoggedIn,
    async function getOneUserFollower(req, res, next) {
        try {
            const { username, followerUsername } = req.params;
            if (req.user.username != username) {
                const invalidUser = new ExpressError(
                    "Cannot View Other Users Followers",
                    403
                );
                return next(invalidUser);
            }
            let follower = await UserFollower.getByUsername(
                username,
                followerUsername
            );
            return res.json(follower);
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
