import { useState, useEffect } from "react";
const useLogin = (key) => {
    const [state, setState] = useState(() => {
        let token;
        try {
            token = window.localStorage.getItem(key) || "";
            token = JSON.parse(token);
            console.log(typeof token);
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
