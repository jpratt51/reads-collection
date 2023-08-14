import { React, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ReadsStashApi from "../api/api.js";
import Messages from "../common/Messages";
import UserContext from "../UserContext.js";

function LoginUser() {
    const navigate = useNavigate();
    const { useLogin, toggleLoggedIn } = useContext(UserContext);
    const INITIAL_STATE = {
        username: "",
        password: "",
    };
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [userToken, setUserToken] = useLogin("user", "");
    const [messages, setMessages] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((data) => ({
            ...data,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res = await new ReadsStashApi().constructor.login(formData);
            setUserToken(
                JSON.stringify({ username: formData.username, token: res })
            );
            setMessages([`User ${formData.username} successfully logged in!`]);
            toggleLoggedIn();
            setTimeout(() => {
                // window.location.reload();
                return navigate("/");
            }, 2500);
        } catch (errors) {
            errors.unshift("Inputs error");
            setMessages(errors);
            console.debug(errors);
            setFormData(INITIAL_STATE);
        }
    };

    return (
        <div>
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
            {messages.length ? <Messages messages={messages} /> : null}
        </div>
    );
}

export default LoginUser;
