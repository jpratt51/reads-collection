"use strict";

const ExpressError = require("../expressError");

function checkForValidInputs(validator) {
    if (!validator.valid) {
        const listOfErrors = validator.errors.map((e) => e.stack);
        const errors = new ExpressError(listOfErrors, 400);
        throw errors;
    }
}

module.exports = checkForValidInputs;
