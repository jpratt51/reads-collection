import React, { useState } from "react";

const RegisterUserForm = () => {
    const [username, setUsername] = useState("");
    const handleChange = (e) => {
        setUsername(e.target.value);
    };
    return (
        <form>
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={handleChange}
            />
            <button>Signup</button>
        </form>
    );
};

export default RegisterUserForm;
