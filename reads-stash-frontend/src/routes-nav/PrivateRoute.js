import React, { useContext } from "react";
import { Route, useNavigate } from "react-router-dom";
import UserContext from "../UserContext";

function PrivateRoute({ path, element }) {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    if (!user) {
        return navigate("/auth/login");
    }

    return <Route path={path} element={element} />;
}

export default PrivateRoute;
