"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", function getAllUserCollections(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get all user's collections request" });
    } catch (error) {
        return next(error);
    }
});

router.get("/:collection_id", function getOneUserCollection(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock get one user collection request" });
    } catch (error) {
        return next(error);
    }
});

router.post("/", function createUserCollection(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Mock create user collection request" });
    } catch (error) {
        return next(error);
    }
});

router.patch("/:collection_id", function updateUserCollection(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock update user collection request" });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:collection_id", function deleteUserCollection(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Mock delete user collection request" });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
