// src/context/userContext.js
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        console.log("[UserProvider] userId:", userId, "token:", token);
    }, [userId, token]);

    return (
        <UserContext.Provider value={{ userId, setUserId, token, setToken }}>
            {children}
        </UserContext.Provider>
    );
};
