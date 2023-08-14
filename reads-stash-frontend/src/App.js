import "./App.css";
import { React, useState, useEffect } from "react";
import AppRoutes from "./routes-nav/Routes";
import useLogin from "./hooks/useLogin";
import UserContext from "./UserContext";
import Navigation from "./routes-nav/Navigation";

function App() {
    const [user, setUser] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        try {
            setUser(JSON.parse(localStorage.getItem("user")));
        } catch {
            setUser("");
        }
    }, [loggedIn]);

    const toggleLoggedIn = () => {
        setLoggedIn(!loggedIn);
    };

    const logout = () => {
        setUser("");
        localStorage.clear();
        toggleLoggedIn();
    };

    return (
        <div>
            <UserContext.Provider value={{ user, useLogin, toggleLoggedIn }}>
                <Navigation logout={logout} />
                <AppRoutes />
            </UserContext.Provider>
        </div>
    );
}

export default App;
