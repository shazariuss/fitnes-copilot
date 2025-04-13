import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentSession, forceSignOut } from "../utils/authUtils";
import { supabase } from "../utils/supabase";
import { Link, useNavigate } from "react-router";

function AuthDebugPage() {
    const { user, session, loading, authError, refreshSession } = useAuth();
    const [localStorageItems, setLocalStorageItems] = useState({});
    const [sessionData, setSessionData] = useState(null);
    const [refreshResult, setRefreshResult] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get all localStorage items related to Supabase
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes("supabase") || key.includes("sb-")) {
                try {
                    items[key] = localStorage.getItem(key);
                } catch (e) {
                    items[key] = `Error reading: ${e.message}`;
                }
            }
        }
        setLocalStorageItems(items);

        // Get current session directly
        const getSessionDirectly = async () => {
            const result = await getCurrentSession();
            setSessionData(result);
        };

        getSessionDirectly();
    }, []);

    const handleTestDatabase = async () => {
        try {
            // Simple test query to verify database connection
            const { data, error } = await supabase
                .from("users")
                .select("count()")
                .limit(1);

            if (error) throw error;

            setTestResult({
                success: true,
                message: `Database connection successful. Row count: ${
                    data[0]?.count || 0
                }`,
            });
        } catch (err) {
            setTestResult({
                success: false,
                message: `Database test failed: ${err.message}`,
            });
        }
    };

    const handleRefreshSession = async () => {
        try {
            const success = await refreshSession();
            setRefreshResult({
                success,
                message: success
                    ? "Session refreshed successfully"
                    : "Session refresh failed",
            });
        } catch (err) {
            setRefreshResult({
                success: false,
                message: `Error: ${err.message}`,
            });
        }
    };

    const handleForceSignOut = async () => {
        await forceSignOut();
        navigate("/login");
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Authentication Debug
                </h1>
                <div className="flex space-x-4">
                    <Link
                        to="/login"
                        className="text-primary-600 hover:text-primary-800 underline"
                    >
                        Go to Login
                    </Link>
                    <Link
                        to="/dashboard"
                        className="text-primary-600 hover:text-primary-800 underline"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Auth Status
                    </h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-semibold">Loading:</span>{" "}
                            {loading.toString()}
                        </div>
                        <div>
                            <span className="font-semibold">User:</span>{" "}
                            {user ? "Authenticated" : "Not authenticated"}
                        </div>
                        <div>
                            <span className="font-semibold">Session:</span>{" "}
                            {session ? "Active" : "None"}
                        </div>
                        {authError && (
                            <div className="text-red-600">
                                <span className="font-semibold">Error:</span>{" "}
                                {authError.message || JSON.stringify(authError)}
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={handleRefreshSession}
                            className="mr-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Refresh Session
                        </button>
                        <button
                            onClick={handleForceSignOut}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Force Sign Out
                        </button>
                    </div>

                    {refreshResult && (
                        <div
                            className={`mt-2 p-2 rounded ${
                                refreshResult.success
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {refreshResult.message}
                        </div>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        User Details
                    </h2>
                    {user ? (
                        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500 italic">
                            No user data available
                        </p>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Session Data
                    </h2>
                    <div className="mb-4">
                        <button
                            onClick={handleTestDatabase}
                            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Test Database Connection
                        </button>
                        {testResult && (
                            <div
                                className={`mt-2 p-2 rounded ${
                                    testResult.success
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {testResult.message}
                            </div>
                        )}
                    </div>
                    {sessionData ? (
                        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                            {JSON.stringify(sessionData, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500 italic">
                            No session data available
                        </p>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Local Storage
                    </h2>
                    {Object.keys(localStorageItems).length > 0 ? (
                        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                            {JSON.stringify(localStorageItems, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500 italic">
                            No Supabase-related items in localStorage
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthDebugPage;
