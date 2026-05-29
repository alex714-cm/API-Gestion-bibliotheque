import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    //si user n'est admin redirect to home page
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/home" />;
    }

    //si il est admin donner le l'acces
    return children;
};