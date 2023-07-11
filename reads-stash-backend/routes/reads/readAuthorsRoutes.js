"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createReadAuthor(req, res) {
    return res.send("Mock create read author request");
});

module.exports = router;
