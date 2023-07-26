import React, { useState } from "react";
import RegisterUserForm from "./RegisterUserForm";
import ReadsStashApi from "./api.js";
import useLogin from "./hooks/useLogin";

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
    const getUserFormData = async (newUser) => {
        setUser({ ...newUser });
        await user;
        try {
            const res = await new ReadsStashApi().constructor.register(
                user.username,
                user.fname,
                user.lname,
                user.email,
                user.password
            );
            await res;
            if (res)
                setUserToken(
                    JSON.stringify({ username: user.username, token: res })
                );
        } catch (e) {
            return {
                Error: "Could not add user to database.",
            };
        }
    };
    return (
        <div>
            <h1>Signup</h1>
            <RegisterUserForm getUserFormData={getUserFormData} />
        </div>
    );
};

export default RegisterUser;
