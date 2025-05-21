import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedAdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedAdminRoute;
