"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.post("/", function createReadAuthor(req, res, next) {
    try {
        return res.status(201).json({ msg: "Mock create read author request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
