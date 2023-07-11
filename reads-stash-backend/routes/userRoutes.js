const express = require("express");
const router = new express.Router();

router.get("/", function getAllUsers(req, res) {
    return res.send("Mock get all users request");
});

module.exports = router;
