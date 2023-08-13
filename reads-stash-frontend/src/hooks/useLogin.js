import { useState, useEffect } from "react";

const useLogin = (key) => {
    const [state, setState] = useState(() => {
        let token;
        try {
            token = JSON.parse(window.localStorage.getItem(key)) || "";
            return token;
        } catch {
            token = "";
        }
    });
    useEffect(() => {
        window.localStorage.setItem(key, state);
    }, [key, state]);
    return [state, setState];
};

export default useLogin;
