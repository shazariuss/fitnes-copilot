import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WeekPage from "./pages/WeekPage";
import ProfilePage from "./pages/ProfilePage";
import WorkoutLogPage from "./pages/WorkoutLogPage";
import ProgressPhotosPage from "./pages/ProgressPhotosPage";
import MeasurementsPage from "./pages/MeasurementsPage";
import AdminPage from "./pages/AdminPage"; // Add this import
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

function App() {
    const { user, loading } = useAuth();
    const [forceRender, setForceRender] = useState(false);

    // Hard timeout of 8 seconds to ensure we never get stuck in loading
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.log("Hard timeout reached - forcing render");
                setForceRender(true);
            }
        }, 8000);

        return () => clearTimeout(timer);
    }, [loading]);

    // If we're still loading and haven't hit the timeout
    if (loading && !forceRender) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-500">Loading your data...</p>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="week/:weekNumber" element={<WeekPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="workout-logs" element={<WorkoutLogPage />} />
                <Route
                    path="workout-log/:weekNumber"
                    element={<WorkoutLogPage />}
                />
                <Route
                    path="progress-photos"
                    element={<ProgressPhotosPage />}
                />
                <Route path="measurements" element={<MeasurementsPage />} />
                {/* Add this route */}
                <Route
                    path="admin"
                    element={
                        <ProtectedAdminRoute>
                            <AdminPage />
                        </ProtectedAdminRoute>
                    }
                />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
