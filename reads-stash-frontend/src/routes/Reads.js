import React from "react";
import GoogleBooksSearchForm from "../GoogleBooksSearchForm";

const Reads = () => {
    return (
        <div>
            <h1>Search for new reads to add to your stash</h1>
            <p>Search by title, author or both</p>
            <GoogleBooksSearchForm />
        </div>
    );
};

export default Reads;
