const express = require("express");
const ExpressError = require("./expressError");

// user routers
const userRoutes = require("./routes/users/userRoutes");
const userCollectionsRoutes = require("./routes/users/userCollectionsRoutes");
const userReadsRoutes = require("./routes/users/userReadsRoutes");
const userBadgesRoutes = require("./routes/users/userBadgesRoutes.js");
const userJournalsRoutes = require("./routes/users/userJournalsRoutes.js");
const userFollowersRoutes = require("./routes/users/userFollowersRoutes.js");
const userFollowedRoutes = require("./routes/users/userFollowedRoutes.js");
const userRecommendationsRoutes = require("./routes/users/userRecommendationsRoutes.js");

// reads routers
const readRoutes = require("./routes/reads/readRoutes.js");
const readCollectionsRoutes = require("./routes/reads/readCollectionsRoutes.js");

// other routers
const badgeRoutes = require("./routes/badgeRoutes.js");

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
app.use("/api/users/:user_id/badges", userBadgesRoutes);
app.use("/api/users", userJournalsRoutes);
app.use("/api/users", userFollowersRoutes);
app.use("/api/users", userFollowedRoutes);
app.use("/api/users", userRecommendationsRoutes);

// reads
app.use("/api/reads", readRoutes);
app.use("/api/reads/:read_id/collections", readCollectionsRoutes);

// other
app.use("/api/badges", badgeRoutes);

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
