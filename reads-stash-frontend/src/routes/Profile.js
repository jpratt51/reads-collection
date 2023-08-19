import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../UserContext";

const Profile = () => {
    const { user } = useContext(UserContext);

    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    return <h1>User Profile Page</h1>;
};

export default Profile;
