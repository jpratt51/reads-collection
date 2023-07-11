"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createAuthor(req, res) {
    return res.status(201).json({ msg: "Mock create author request" });
});

module.exports = router;
