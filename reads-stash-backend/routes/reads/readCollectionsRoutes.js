"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createReadCollection(req, res) {
    return res.send("Mock create read collection request");
});

router.delete("/:collection_id", function deleteReadCollection(req, res) {
    return res.send("Mock delete read collection request");
});

module.exports = router;
