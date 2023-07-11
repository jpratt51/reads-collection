"use strict";

const express = require("express");
const router = new express.Router();

router.post("/", function createReadCollection(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Mock create read collection request" });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:collection_id", function deleteReadCollection(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock delete read collection request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
