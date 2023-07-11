"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createAuthor(req, res, next) {
    try {
        return res.status(201).json({ msg: "Mock create author request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
