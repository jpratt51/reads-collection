import { React, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ReadsStashApi from "../api/api.js";
import UserContext from "../UserContext.js";

function LoginUser() {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);
    const INITIAL_STATE = {
        username: "",
        password: "",
    };
    const [formData, setFormData] = useState(INITIAL_STATE);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((data) => ({
            ...data,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { username, password } = formData;
        async function loginUser() {
            let res = await new ReadsStashApi().constructor.login({
                username: username || "",
                password: password || "",
            });
            await res;
            login(username, res);
            navigate("/");
        }
        loginUser();
        setFormData(INITIAL_STATE);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username"></label>
            <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                placeholder="username"
                onChange={handleChange}
            />

            <label htmlFor="password"></label>
            <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                placeholder="password"
                onChange={handleChange}
            />
            <button>Login</button>
        </form>
    );
}

export default LoginUser;
