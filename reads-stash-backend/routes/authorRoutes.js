"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createAuthor(req, res) {
    return res.send("Mock create author request");
});

module.exports = router;
