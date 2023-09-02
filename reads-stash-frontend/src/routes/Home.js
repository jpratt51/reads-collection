import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserContext from "../UserContext.js";

const Home = () => {
    const { user } = useContext(UserContext);
    const [userHomePage, setUserHomePage] = useState("");

    useEffect(() => {
        if (user) {
            setUserHomePage(true);
        } else {
            setUserHomePage(false);
        }
    }, [user]);

    if (userHomePage === true) {
        return (
            <div>
                <h1>Welcome back {user.username}!</h1>
            </div>
        );
    } else {
        return (
            <div>
                <h1>Welcome to reads stash!</h1>
                <h2>Sign in or register below!</h2>
                <Link to="/auth/login">Sign In</Link>
                <Link to="/auth/register">Register</Link>
            </div>
        );
    }
};

export default Home;
