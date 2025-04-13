import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";

function WorkoutLogPage() {
    const { weekNumber } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [weekNum, setWeekNum] = useState(
        weekNumber ? parseInt(weekNumber) : null
    );
    const [notes, setNotes] = useState("");
    const [intensity, setIntensity] = useState("medium");
    const [duration, setDuration] = useState(30);
    const [rating, setRating] = useState(3);
    const [isEditing, setIsEditing] = useState(!!weekNumber);

    // Fetch all workout logs
    const { data: logs, isLoading: logsLoading } = useQuery({
        queryKey: ["workoutLogs", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workout_logs")
                .select("*")
                .eq("user_id", user?.id)
                .order("week", { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.id && !weekNumber,
    });

    // Fetch single workout log if editing
    const { data: currentLog, isLoading: currentLogLoading } = useQuery({
        queryKey: ["workoutLog", user?.id, weekNum],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workout_logs")
                .select("*")
                .eq("user_id", user?.id)
                .eq("week", weekNum)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user?.id && !!weekNum,
    });

    // Update form with current log data when editing
    useEffect(() => {
        if (currentLog) {
            setNotes(currentLog.notes || "");
            setIntensity(currentLog.intensity || "medium");
            setDuration(currentLog.duration || 30);
            setRating(currentLog.rating || 3);
        }
    }, [currentLog]);

    // Save workout log mutation
    const saveLogMutation = useMutation({
        mutationFn: async () => {
            const logData = {
                user_id: user.id,
                week: weekNum,
                notes,
                intensity,
                duration,
                rating,
                logged_at: new Date().toISOString(),
            };

            if (currentLog) {
                // Update existing log
                const { error } = await supabase
                    .from("workout_logs")
                    .update(logData)
                    .eq("id", currentLog.id);

                if (error) throw error;
            } else {
                // Insert new log
                const { error } = await supabase
                    .from("workout_logs")
                    .insert(logData);

                if (error) throw error;
            }
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: ["workoutLogs", user?.id],
            });
            queryClient.invalidateQueries({
                queryKey: ["workoutLog", user?.id, weekNum],
            });

            // Reset form if not editing
            if (!isEditing) {
                setNotes("");
                setIntensity("medium");
                setDuration(30);
                setRating(3);
                setWeekNum(null);
            } else {
                // Go back to logs list
                navigate("/workout-logs");
            }
        },
        onError: (error) => {
            console.error("Error saving workout log:", error);
            alert("Failed to save workout log. Please try again.");
        },
    });

    // Delete workout log mutation
    const deleteLogMutation = useMutation({
        mutationFn: async (logId) => {
            const { error } = await supabase
                .from("workout_logs")
                .delete()
                .eq("id", logId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["workoutLogs", user?.id],
            });
        },
        onError: (error) => {
            console.error("Error deleting workout log:", error);
            alert("Failed to delete workout log. Please try again.");
        },
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!weekNum) {
            alert("Please select a week.");
            return;
        }

        saveLogMutation.mutate();
    };

    // Loading state
    if ((weekNumber && currentLogLoading) || (!weekNumber && logsLoading)) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing
                        ? `Edit Workout Log - Week ${weekNum}`
                        : "Workout Logs"}
                </h1>
                <button
                    onClick={() =>
                        navigate(isEditing ? "/workout-logs" : "/dashboard")
                    }
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    ← Back to {isEditing ? "Logs" : "Dashboard"}
                </button>
            </div>

            {/* Form to add/edit workout log */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {isEditing ? "Update Workout Log" : "Add New Workout Log"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isEditing && (
                        <div>
                            <label
                                htmlFor="weekNum"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Week Number
                            </label>
                            <select
                                id="weekNum"
                                value={weekNum || ""}
                                onChange={(e) =>
                                    setWeekNum(parseInt(e.target.value))
                                }
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">-- Select Week --</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Week {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            How long did you workout? (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="240"
                            value={duration}
                            onChange={(e) =>
                                setDuration(parseInt(e.target.value))
                            }
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            How intense was your workout?
                        </label>
                        <div className="flex space-x-4">
                            {["light", "medium", "intense"].map((level) => (
                                <label
                                    key={level}
                                    className="flex items-center"
                                >
                                    <input
                                        type="radio"
                                        name="intensity"
                                        value={level}
                                        checked={intensity === level}
                                        onChange={() => setIntensity(level)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 capitalize">
                                        {level}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate this workout (1-5)
                        </label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center focus:outline-none ${
                                        rating >= num
                                            ? "bg-primary-500 text-white"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="How did you feel? Any modifications you made?"
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saveLogMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {saveLogMutation.isPending
                                ? "Saving..."
                                : isEditing
                                ? "Update Log"
                                : "Save Log"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Display workout logs if not editing */}
            {!isEditing && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Your Workout History
                    </h2>

                    {logs?.length === 0 ? (
                        <p className="text-gray-500 italic">
                            No workout logs yet. Add your first log above!
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Week
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Intensity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs?.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Week {log.week}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(
                                                    log.logged_at
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.duration} min
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {log.intensity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.rating}/5
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/workout-log/${log.week}`}
                                                    className="text-primary-600 hover:text-primary-900 mr-4"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        deleteLogMutation.mutate(
                                                            log.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkoutLogPage;
