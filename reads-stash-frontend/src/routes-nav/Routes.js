import React from "react";
import Home from "../routes/Home";
import Login from "../routes/Login";
import RegisterUser from "../routes/RegisterUser";
import Profile from "../routes/Profile";
import Reads from "../routes/Reads";
import { Routes, Route } from "react-router-dom";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/register" element={<RegisterUser />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/user/reads" element={<Reads />} />
        </Routes>
    );
}

export default AppRoutes;
