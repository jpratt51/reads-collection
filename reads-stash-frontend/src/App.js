import "./App.css";
import { React, useState } from "react";
import AppRoutes from "./routes-nav/Routes";
import useLogin from "./hooks/useLogin";
import UserContext from "./UserContext.js";

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
                <AppRoutes />
            </UserContext.Provider>
        </div>
    );
}

export default App;
