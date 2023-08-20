import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../UserContext";
import GoogleBooksSearchForm from "../GoogleBooksSearchForm";

const Reads = () => {
    const { user } = useContext(UserContext);

    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    return (
        <div>
            <h1>Reads Page</h1>
            <GoogleBooksSearchForm />
        </div>
    );
};

export default Reads;
