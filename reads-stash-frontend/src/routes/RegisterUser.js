import React, { useState } from "react";
import ReadsStashApi from "../api.js";
import useLogin from "../hooks/useLogin";
import ErrorMessages from "../ErrorMessages";

const RegisterUser = () => {
    const INITIAL_STATE = {
        username: "",
        fname: "",
        lname: "",
        email: "",
        password: "",
    };
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [userToken, setUserToken] = useLogin("user", "");
    const [errors, setErrors] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((formData) => ({
            ...formData,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        try {
            res = await new ReadsStashApi().constructor.register({
                username: formData.username,
                fname: formData.fname,
                lname: formData.lname,
                email: formData.email,
                password: formData.password,
            });
            setUserToken(
                JSON.stringify({ username: formData.username, token: res })
            );
        } catch (errors) {
            setErrors(errors);
            console.debug(errors);
        }
        setFormData(INITIAL_STATE);
    };

    return (
        <div>
            <h1>Signup</h1>
            <form>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                />
                <label htmlFor="fname">First Name</label>
                <input
                    id="fname"
                    type="text"
                    name="fname"
                    placeholder="first name"
                    value={formData.fname}
                    onChange={handleChange}
                />
                <label htmlFor="lname">Last Name</label>
                <input
                    id="lname"
                    type="text"
                    name="lname"
                    placeholder="last name"
                    value={formData.lname}
                    onChange={handleChange}
                />
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="text"
                    name="email"
                    placeholder="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="text"
                    name="password"
                    placeholder="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <button onClick={handleSubmit}>Signup</button>
            </form>
            {errors.length ? <ErrorMessages errors={errors} /> : null}
        </div>
    );
};

export default RegisterUser;
