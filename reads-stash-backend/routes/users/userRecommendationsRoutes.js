"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserRecommendations(req, res) {
    return res
        .status(200)
        .json({ msg: "Dummy get all user recommendations response" });
});

router.get("/:recommendation_id", function getOneUserRecommendation(req, res) {
    return res
        .status(200)
        .json({ msg: "Dummy get one user recommendation response" });
});

router.post("/", function createUserRecommendation(req, res) {
    return res
        .status(201)
        .json({ msg: "Dummy created user recommendation response" });
});

router.patch(
    "/:recommendation_id",
    function updateUserRecommendation(req, res) {
        return res
            .status(200)
            .json({ msg: "Dummy updated user recommendation response" });
    }
);

router.delete(
    "/:recommendation_id",
    function deleteUserRecommendation(req, res) {
        return res
            .status(200)
            .json({ msg: "Dummy deleted user recommendation response" });
    }
);

module.exports = router;
