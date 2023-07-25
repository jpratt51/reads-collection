"use strict";

const express = require("express");
const ExpressError = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const morgan = require("morgan");

const userRoutes = require("./routes/users/users");
const userCollectionsRoutes = require("./routes/users/collections");
const userReadsRoutes = require("./routes/users/reads");
const userBadgesRoutes = require("./routes/users/badges");
const userJournalsRoutes = require("./routes/users/journals");
const userFollowersRoutes = require("./routes/users/followers");
const userFollowedRoutes = require("./routes/users/followed");
const userRecommendationsRoutes = require("./routes/users/recommendations");
const readsCollectionsRoutes = require("./routes/reads/collections");

const readRoutes = require("./routes/reads/reads");

const badgeRoutes = require("./routes/badges");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(authenticateJWT);
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/users", userCollectionsRoutes);
app.use("/api/users", userReadsRoutes);
app.use("/api/users", userBadgesRoutes);
app.use("/api/users", userJournalsRoutes);
app.use("/api/users", userFollowersRoutes);
app.use("/api/users", userFollowedRoutes);
app.use("/api/users", userRecommendationsRoutes);

app.use("/api/reads", readRoutes);
app.use("/api/reads", readsCollectionsRoutes);

app.use("/api/badges", badgeRoutes);
app.use("/api/auth", authRoutes);

app.use(function notFoundErrorHandler(req, res, next) {
    const e = new ExpressError("Page Not Found", 404);
    next(e);
});

app.use(function globalErrorHandler(error, req, res, next) {
    let status = error.status || 500;
    let message = error.msg || "Internal Server Error";
    return res.status(status).json({ error: { message, status } });
});

module.exports = app;
