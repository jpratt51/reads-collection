"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const User = require("../models/users/user");

route.post("/register", async function registerUser(req, res, next) {
    try {
        const { username, fname, lname, email, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const user = await User.create(username, fname, lname, email, hashedPw);
        return res.status(201).json(user);
    } catch (error) {
        if (error.code === "23505") {
            return next(
                new ExpressError("Username taken. Please pick another.", 400)
            );
        }
        return next(e);
    }
});

module.exports = router;
