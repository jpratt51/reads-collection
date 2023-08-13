import React from "react";
import Home from "../routes/Home";
import Login from "../routes/Login";
import RegisterUser from "../routes/RegisterUser";
// import PrivateRoute from "./PrivateRoute";
import { Routes, Route } from "react-router-dom";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/register" element={<RegisterUser />} />
            <Route path="/auth/login" element={<Login />} />
        </Routes>
    );
}

export default AppRoutes;
