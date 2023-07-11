"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function getAllUserRecommendations(req, res) {
    return res.send("Mock get all user's recommendations request");
});

router.get("/:recommendation_id", function getOneUserRecommendation(req, res) {
    return res.send("Mock get one user recommendation request");
});

router.post("/", function createUserRecommendation(req, res) {
    return res.send("Mock create user recommendation request");
});

router.patch(
    "/:recommendation_id",
    function updateUserRecommendation(req, res) {
        return res.send("Mock update user recommendation request");
    }
);

router.delete(
    "/:recommendation_id",
    function deleteUserRecommendation(req, res) {
        return res.send("Mock delete user recommendation request");
    }
);

module.exports = router;
