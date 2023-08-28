import React from "react";
import Home from "../routes/Home";
import Login from "../routes/Login";
import RegisterUser from "../routes/RegisterUser";
import Profile from "../routes/Profile";
import Reads from "../routes/Reads";
import ReadDetails from "../routes/ReadDetails";
import { Routes, Route, Navigate } from "react-router-dom";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/register" element={<RegisterUser />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/reads" element={<Reads />} />
            <Route path="/read/:id" element={<ReadDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
