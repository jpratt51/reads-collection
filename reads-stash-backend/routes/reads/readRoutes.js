"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllReads(req, res, next) {
    try {
        return res.status(200).json({ msg: "Mock get all reads request" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:read_id", function getOneRead(req, res, next) {
    try {
        return res.status(200).json({ msg: "Mock get one read request" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", function createRead(req, res, next) {
    try {
        return res.status(201).json({ msg: "Mock create read request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
