import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div>
            <h1>Welcome to reads stash!</h1>
            <h2>Sign in or register below!</h2>
            <Link to="/auth/login">Sign In</Link>
            <Link to="/auth/register">Register</Link>
        </div>
    );
};

export default Home;
