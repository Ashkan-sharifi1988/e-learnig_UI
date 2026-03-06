import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userType, setUserType] = useState(null); // Added userType for role-based access
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
        const storedUserId = sessionStorage.getItem("userID") || localStorage.getItem("userID");
        const storedUserType = sessionStorage.getItem("userType") || localStorage.getItem("userType");

        if (token && storedUserId && storedUserType) {
            setIsAuthenticated(true);
            setUserId(storedUserId);
            setUserType(Number(storedUserType)); // Parse userType as a number
        } else {
            setIsAuthenticated(false);
            setUserId(null);
            setUserType(null);
        }
        setIsLoading(false); // Ensure this is called after all checks
    }, []);

    const login = (token, userId, userType) => {
        setIsAuthenticated(true);
        setUserId(userId);
        setUserType(userType); // Save userType in state
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserId(null);
        setUserType(null);
        sessionStorage.clear();
        localStorage.clear();
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, userId, userType, isLoading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
