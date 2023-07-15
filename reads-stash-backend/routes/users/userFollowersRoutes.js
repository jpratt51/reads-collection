"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const UserFollower = require("../../models/users/userFollower");

router.get(
    "/:userId/followers",
    async function getAllUserFollowers(req, res, next) {
        try {
            const { userId } = req.params;
            let followers = await UserFollower.getAll(userId);
            return res.status(200).json(followers);
        } catch (error) {
            return next(error);
        }
    }
);

router.get(
    "/:userId/followers/:followerId",
    async function getOneUserFollower(req, res, next) {
        try {
            const { userId, followerId } = req.params;
            let follower = await UserFollower.getById(userId, followerId);
            return res.status(200).json(follower);
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
