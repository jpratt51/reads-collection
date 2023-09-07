import React from "react";
import ReadsStashSearchForm from "../../forms/ReadsStashSearchForm";

const UserReads = () => {
    return (
        <div>
            <h1>Search your reads stash</h1>
            <p>Search by author, title or both (case sensitive)</p>
            <ReadsStashSearchForm />
        </div>
    );
};

export default UserReads;
