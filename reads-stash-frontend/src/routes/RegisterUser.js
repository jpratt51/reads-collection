import React, { useState } from "react";
import RegisterUserForm from "../RegisterUserForm";
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
    const [user, setUser] = useState(INITIAL_STATE);
    const [userToken, setUserToken] = useLogin("user", "");
    const [errors, setErrors] = useState("");
    console.debug(errors);
    const getUserFormData = async (newUser) => {
        setUser({ ...newUser });
        let res;
        try {
            res = await new ReadsStashApi().constructor.register(
                user.username,
                user.fname,
                user.lname,
                user.email,
                user.password
            );
        } catch (errors) {
            setErrors(errors);
        }
        setUserToken(JSON.stringify({ username: user.username, token: res }));
    };

    return (
        <div>
            <h1>Signup</h1>
            <RegisterUserForm getUserFormData={getUserFormData} />
            {errors.length ? <ErrorMessages errors={errors} /> : null}
        </div>
    );
};

export default RegisterUser;
