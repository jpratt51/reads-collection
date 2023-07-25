import React, { useState } from "react";
import RegisterUserForm from "./RegisterUserForm";
import ReadsStashApi from "./api.js";

const RegisterUser = () => {
    const INITIAL_STATE = {
        username: "",
        fname: "",
        lname: "",
        email: "",
        password: "",
    };
    const [user, setUser] = useState(INITIAL_STATE);
    const getUserFormData = async (newUser) => {
        setUser({ ...newUser });
        await user;
        await new ReadsStashApi().constructor.register(
            user.username,
            user.fname,
            user.lname,
            user.email,
            user.password
        );
    };
    return (
        <div>
            <h1>Signup</h1>
            <RegisterUserForm getUserFormData={getUserFormData} />
        </div>
    );
};

export default RegisterUser;
