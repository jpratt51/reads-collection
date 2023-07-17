"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");
const User = require("../../models/users/user");
const { ensureLoggedIn } = require("../../middleware/auth");

router.get("/", ensureLoggedIn, async function getAllUsers(req, res, next) {
    try {
        let users = await User.getAll();
        return res.status(200).json(users);
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:userId",
    ensureLoggedIn,
    async function getOneUser(req, res, next) {
        try {
            const { userId } = req.params;
            let user = await User.getById(userId);
            return res.status(200).json(user);
        } catch (error) {
            return next(error);
        }
    }
);

// router.post("/", async function createUser(req, res, next) {
//     try {
//         const { username, fname, lname, email, password } = req.body;
//         const user = await User.create(username, fname, lname, email, password);
//         return res.status(201).json(user);
//     } catch (error) {
//         return next(error);
//     }
// });

router.patch(
    "/:userId",
    ensureLoggedIn,
    async function updateUser(req, res, next) {
        try {
            const { userId } = req.params;
            const inputs = req.body;
            const user = await User.getById(userId);
            inputs.username ? (user.username = inputs.username) : null;
            inputs.fname ? (user.fname = inputs.fname) : null;
            inputs.lname ? (user.lname = inputs.lname) : null;
            inputs.email ? (user.email = inputs.email) : null;
            await user.update();
            return res.status(200).json(user);
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:userId",
    ensureLoggedIn,
    async function deleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await User.getById(userId);
            await user.delete();
            return res.status(200).json({ msg: `Deleted user ${userId}` });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
