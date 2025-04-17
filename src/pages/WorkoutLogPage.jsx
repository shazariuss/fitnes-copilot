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
                        : "Mashg'ulotlar tarixi"}
                </h1>
                <button
                    onClick={() =>
                        navigate(isEditing ? "/workout-logs" : "/dashboard")
                    }
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    ← {isEditing ? "Logs" : "Dashboard"}
                </button>
            </div>

            {/* Form to add/edit workout log */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {isEditing
                        ? "Update Workout Log"
                        : "Yangi mashg'ulot qo'shish"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isEditing && (
                        <div>
                            <label
                                htmlFor="weekNum"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Hafta raqami
                            </label>
                            <select
                                id="weekNum"
                                value={weekNum || ""}
                                onChange={(e) =>
                                    setWeekNum(parseInt(e.target.value))
                                }
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">-- Haftani tanlash --</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Hafta {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Qancha vaqt mashq qildingiz? (minutlar)
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
                            Mashqingiz qanday darajda o'tdi?
                        </label>
                        <div className="flex space-x-4">
                            {["yengil", "o'rta", "shiddatli"].map((level) => (
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
                            Mashg'ulotni baholang (1-5)
                        </label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center focus:outline-none ${
                                        rating >= num
                                            ? "bg-sky-500 text-white"
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
                            Eslatmalar
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="O'zingizni qanday his qildingiz? "
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saveLogMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
                        Sizning mashg'ulotlar tarixingiz.
                    </h2>

                    {logs?.length === 0 ? (
                        <p className="text-gray-500 italic">
                            Hali ma'lumot yo'q.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hafta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sana
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Davomiylik
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Shiddatlilik
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Baho
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harakatlar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs?.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Hafta {log.week}
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
