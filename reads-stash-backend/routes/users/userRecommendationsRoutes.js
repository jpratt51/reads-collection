"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../../db");

router.get("/", function getAllUserRecommendations(req, res, next) {
    try {
        return res
            .status(200)
            .json({ msg: "Dummy get all user recommendations response" });
    } catch (error) {
        return next(error);
    }
});

router.get(
    "/:recommendation_id",
    function getOneUserRecommendation(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Dummy get one user recommendation response" });
        } catch (error) {
            return next(error);
        }
    }
);

router.post("/", function createUserRecommendation(req, res, next) {
    try {
        return res
            .status(201)
            .json({ msg: "Dummy created user recommendation response" });
    } catch (error) {
        return next(error);
    }
});

router.patch(
    "/:recommendation_id",
    function updateUserRecommendation(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Dummy updated user recommendation response" });
        } catch (error) {
            return next(error);
        }
    }
);

router.delete(
    "/:recommendation_id",
    function deleteUserRecommendation(req, res, next) {
        try {
            return res
                .status(200)
                .json({ msg: "Dummy deleted user recommendation response" });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
