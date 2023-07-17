"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users/user");
const SECRET_KEY = require("../config");

router.post("/register", async function registerUser(req, res, next) {
    try {
        const { username, fname, lname, email, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }
        const hashedPw = await bcrypt.hash(password, 12);
        const user = await User.create(username, fname, lname, email, hashedPw);
        console.log(user);
        return res.status(201).json(user);
    } catch (error) {
        if (error.code === "23505") {
            return next(
                new ExpressError("Username taken. Please pick another.", 400)
            );
        }
        return next(error);
    }
});

router.post("/login", async function loginUser(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }
        const user = await User.getByUsername(username);
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ message: "Successfully logged in!" });
        }
        throw new ExpressError("Invalid username/password", 400);
    } catch (error) {
        return next(e);
    }
});

module.exports = router;
