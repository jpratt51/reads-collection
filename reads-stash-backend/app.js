const express = require("express");
const ExpressError = require("./expressError");

// user routers
const userRoutes = require("./routes/users/users");
const userCollectionsRoutes = require("./routes/users/collections");
const userReadsRoutes = require("./routes/users/reads");
const userBadgesRoutes = require("./routes/users/badges");
const userJournalsRoutes = require("./routes/users/journals");
const userFollowersRoutes = require("./routes/users/followers");
const userFollowedRoutes = require("./routes/users/followed");
const userRecommendationsRoutes = require("./routes/users/recommendations");

// reads routers
const readRoutes = require("./routes/reads/reads");
const readCollectionsRoutes = require("./routes/reads/collections");

// other routers
const badgeRoutes = require("./routes/badges");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
// for a RESTful api, put api in front of all routes, return 200 status code for all successfully requested routes except post requests (return 201 status code), returns should be in json object format, return json, and follow this naming conventions:

// RESTful routes for a resource called snacks:

// HTTP Verb	Route	Meaning
// GET	/snacks	Get all snacks
// GET	/snacks/[id]	Get snack
// POST	/snacks	Create snack
// PUT / PATCH	/snacks/[id]	Update snack
// DELETE	/snacks/[id]	Delete snack

// users
app.use("/api/users", userRoutes);
app.use("/api/users", userCollectionsRoutes);
app.use("/api/users", userReadsRoutes);
app.use("/api/users", userBadgesRoutes);
app.use("/api/users", userJournalsRoutes);
app.use("/api/users", userFollowersRoutes);
app.use("/api/users", userFollowedRoutes);
app.use("/api/users", userRecommendationsRoutes);

// reads
app.use("/api/reads", readRoutes);
app.use("/api/reads", readCollectionsRoutes);

// other
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

app.listen(3000, () => {
    console.log("App on port 3000");
});
