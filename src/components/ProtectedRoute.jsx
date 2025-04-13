import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const [forceRender, setForceRender] = useState(false);

    // Set a hard timeout to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.log("Protected route timeout reached");
                setForceRender(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [loading]);

    // If we're loading and haven't hit the timeout
    if (loading && !forceRender) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // If we have a user (or we've hit the timeout but there's still a user)
    if (user) {
        return children;
    }

    // Otherwise redirect to login
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
}

export default ProtectedRoute;
