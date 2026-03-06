import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userType, isLoading } = useContext(AuthContext);

    // Show a loading spinner until authentication is resolved
    if (isLoading) {
        return (
            <div className="spinner-container" style={{ height: "50vh" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to "Not Authorized" if userType is not in allowedRoles
    if (allowedRoles && !allowedRoles.includes(userType)) {
        return <Navigate to="/not-authorized" replace />;
    }

    return children;
};

export default PrivateRoute;
