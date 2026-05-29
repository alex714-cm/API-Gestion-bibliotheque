import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const UserRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Si non connecté → login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Si admin → rediriger vers l'espace admin
    if (user.role === 'ADMIN') {
        return <Navigate to="/admin/dashboard" />;
    }

    // Lecteur → accès autorisé
    return children;
};
