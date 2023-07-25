import React, { useState } from "react";

const RegisterUserForm = () => {
    const INITIAL_STATE = {
        username: "",
        fname: "",
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
        // const { username, fname } = formData;
        setFormData(INITIAL_STATE);
    };
    return (
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
                value={formData.fname}
                onChange={handleChange}
            />
            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="text"
                name="email"
                placeholder="email"
                value={formData.fname}
                onChange={handleChange}
            />
            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="text"
                name="password"
                placeholder="password"
                value={formData.fname}
                onChange={handleChange}
            />
            <button onClick={handleSubmit}>Signup</button>
        </form>
    );
};

export default RegisterUserForm;
