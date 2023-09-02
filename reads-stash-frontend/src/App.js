import "./App.css";
import { React, useState, useEffect } from "react";
import AppRoutes from "./routes-nav/Routes";
import useLogin from "./hooks/useLogin";
import UserContext from "./UserContext";
import Navigation from "./routes-nav/Navigation";

function App() {
    const [user, setUser] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const errorLoadingMessage = (
        <p>Oops... something went wrong! Please try again.</p>
    );

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
        localStorage.removeItem("user");
        toggleLoggedIn();
    };

    return (
        <div>
            <UserContext.Provider
                value={{ user, useLogin, toggleLoggedIn, errorLoadingMessage }}
            >
                <Navigation logout={logout} />
                <AppRoutes />
            </UserContext.Provider>
        </div>
    );
}

export default App;
