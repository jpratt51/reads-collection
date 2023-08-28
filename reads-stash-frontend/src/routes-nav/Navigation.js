import { React, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import UserContext from "../UserContext.js";

function Navigation({ logout }) {
    const { user } = useContext(UserContext);

    function UserNavBar() {
        return (
            <ul>
                <li>
                    <Link to="/" onClick={logout}>
                        Logout {user.username}
                    </Link>
                </li>
                <li>
                    <NavLink to="/user/profile">Profile</NavLink>
                </li>
                <li>
                    <NavLink to="/reads">Reads</NavLink>
                </li>
            </ul>
        );
    }

    function LoggedOutNavBar() {
        return (
            <ul>
                <li>
                    <NavLink to="/auth/register">Register</NavLink>
                </li>
                <li>
                    <NavLink to="/auth/login">Login</NavLink>
                </li>
            </ul>
        );
    }

    return (
        <div>
            <nav>
                <NavLink to="/">ReadsStash</NavLink>
                {user ? UserNavBar() : LoggedOutNavBar()}
            </nav>
        </div>
    );
}

export default Navigation;
