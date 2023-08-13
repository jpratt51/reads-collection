import "./App.css";
import { React, useState } from "react";
import RegisterUser from "./routes/RegisterUser";
import Home from "./routes/Home";
import LoginUser from "./routes/Login";
import useLogin from "./hooks/useLogin";
import UserContext from "./UserContext.js";
import { Routes, Route } from "react-router-dom";

function App() {
    let userInfo;

    try {
        userInfo = JSON.parse(localStorage.getItem("user")) || "";
    } catch {
        userInfo = "";
    }

    const [user, setUser] = useState(userInfo);

    const logout = () => {
        setUser("");
        localStorage.clear();
    };

    return (
        <div>
            <UserContext.Provider value={{ user, useLogin, logout }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth/register" element={<RegisterUser />} />
                    <Route path="/auth/login" element={<LoginUser />} />
                </Routes>
            </UserContext.Provider>
        </div>
    );
}

export default App;
