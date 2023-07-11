const express = require("express");

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
const readAuthorsRoutes = require("./routes/reads/readAuthorsRoutes.js");

// other routers
const authorRoutes = require("./routes/authorRoutes.js");
const badgeRoutes = require("./routes/badgeRoutes.js");

const app = express();

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
app.use("/api/users/:user_id/collections", userCollectionsRoutes);
app.use("/api/users/:user_id/reads", userReadsRoutes);
app.use("/api/users/:user_id/badges", userBadgesRoutes);
app.use("/api/users/:user_id/journals", userJournalsRoutes);
app.use("/api/users/:user_id/followers", userFollowersRoutes);
app.use("/api/users/:user_id/followed", userFollowedRoutes);
app.use("/api/users/:user_id/recommendations", userRecommendationsRoutes);

// reads
app.use("/api/reads", readRoutes);
app.use("/api/reads/:read_id/collections", readCollectionsRoutes);
app.use("/api/reads/:read_id/authors", readAuthorsRoutes);

// other
app.use("/api/authors", authorRoutes);
app.use("/api/badges", badgeRoutes);

app.listen(3000, function () {
    console.log("App on port 3000");
});
