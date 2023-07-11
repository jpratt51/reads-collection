const express = require("express");

const userRoutes = require("./routes/users/userRoutes");
const userCollectionRoutes = require("./routes/users/userCollectionRoutes");

const app = express();

// for a RESTful api, put api in front of all routes, return 200 status code for all successfully requested routes except post requests (return 201 status code), returns should be in json object format, return json, and follow this naming conventions:

// RESTful routes for a resource called snacks:

// HTTP Verb	Route	Meaning
// GET	/snacks	Get all snacks
// GET	/snacks/[id]	Get snack
// POST	/snacks	Create snack
// PUT / PATCH	/snacks/[id]	Update snack
// DELETE	/snacks/[id]	Delete snack

app.use("/api/users", userRoutes);
app.use("/api/users/collections", userCollectionRoutes);

app.listen(3000, function () {
    console.log("App on port 3000");
});
