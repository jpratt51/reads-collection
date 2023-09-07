import React from "react";
import Home from "../routes/Home";
import Login from "../routes/Login";
import RegisterUser from "../routes/RegisterUser";
import Profile from "../routes/Profile";
import Reads from "../routes/Reads";
import UserReads from "../routes/user/Reads";
import ReadDetails from "../routes/ReadDetails";
import UserCollections from "../routes/user/Collections";
import CollectionDetails from "../routes/user/CollectionDetails";
import { Routes, Route, Navigate } from "react-router-dom";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/register" element={<RegisterUser />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/reads" element={<Reads />} />
            <Route path="/read/:isbn" element={<ReadDetails />} />
            <Route path="/user/reads" element={<UserReads />} />
            <Route path="/user/collections" element={<UserCollections />} />
            <Route
                path="/user/collections/:name"
                element={<CollectionDetails />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
