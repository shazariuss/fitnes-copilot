import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

function WeekPage() {
    const { weekNumber } = useParams();
    const weekNum = parseInt(weekNumber, 10);
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeDay, setActiveDay] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Days of the week
    const daysOfWeek = [
        "Dushanba",
        "Seshanba",
        "Chorshanba",
        "Payshanba",
        "Juma",
        "Shanba",
        "Yakshanba",
    ];

    // Fetch daily workouts for this week
    const { data: dailyWorkouts, isLoading: workoutsLoading } = useQuery({
        queryKey: ["dailyWorkouts", user?.category, weekNum],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("daily_workouts")
                .select("*")
                .eq("category", user?.category)
                .eq("week_number", weekNum)
                .order("day_number", { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!user && !!weekNum,
    });

    console.log(user);

    // Fetch daily meals for this week
    const { data: dailyMeals, isLoading: mealsLoading } = useQuery({
        queryKey: ["dailyMeals", user?.category, weekNum],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("daily_meals")
                .select("*")
                .eq("category", user?.category)
                .eq("week_number", weekNum)
                .order("day_number", { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!user && !!weekNum,
    });

    // Fetch progress for this week
    const { data: weekProgress, isLoading: progressLoading } = useQuery({
        queryKey: ["weekProgress", user?.id, weekNum],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("progress")
                .select("*")
                .eq("user_id", user?.id)
                .eq("week", weekNum)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user?.id && !!weekNum,
    });

    // Mark week as completed mutation
    const markAsCompletedMutation = useMutation({
        mutationFn: async () => {
            setIsSubmitting(true);

            // If progress entry already exists, update it
            if (weekProgress) {
                const { error } = await supabase
                    .from("progress")
                    .update({
                        completed: true,
                        completed_at: new Date().toISOString(),
                    })
                    .eq("id", weekProgress.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("progress").insert({
                    user_id: user.id,
                    week: weekNum,
                    completed: true,
                    completed_at: new Date().toISOString(),
                });

                if (error) throw error;
            }
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
            queryClient.invalidateQueries({
                queryKey: ["weekProgress", user?.id, weekNum],
            });

            // Navigate back to dashboard
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error("Error marking week as completed:", error);
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    // Find the active day's workout and meal
    const activeWorkout = dailyWorkouts?.find(
        (workout) => workout.day_number === activeDay
    );
    const activeMeal = dailyMeals?.find(
        (meal) => meal.day_number === activeDay
    );

    // Handle "Mark as Completed" button click
    const handleMarkAsCompleted = () => {
        markAsCompletedMutation.mutate();
    };

    // Group workouts by day for the sidebar
    const workoutsByDay =
        dailyWorkouts?.reduce((acc, workout) => {
            if (!acc[workout.day_number]) {
                acc[workout.day_number] = [];
            }
            acc[workout.day_number].push(workout);
            return acc;
        }, {}) || {};

    // Loading state
    if (workoutsLoading || mealsLoading || progressLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    // If week has no workouts or meals
    if (dailyWorkouts?.length === 0 && dailyMeals?.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Hafta {weekNum}
                    </h1>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-sky-600 hover:text-sky-800 font-medium"
                    >
                        ← Bosh sahifaga qaytish
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Bu hafta uchun ma'lumotlar hali kiritilmagan
                    </h2>
                    <p className="mb-4">
                        Bu hafta uchun mashg'ulotlar va ovqatlanish rejasi hali
                        qo'shilmagan. Iltimos, keyinroq qayta tekshiring.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
                    >
                        Bosh sahifaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Hafta {weekNum}
                </h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-sky-600 hover:text-sky-800 font-medium"
                >
                    ← Bosh sahifaga qaytish
                </button>
            </div>

            {/* Day selection tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex overflow-x-auto pb-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <button
                            key={day}
                            className={`py-3 px-4 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                                activeDay === day
                                    ? "border-sky-500 text-sky-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setActiveDay(day)}
                        >
                            Kun {day} - {daysOfWeek[day - 1]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Workout Section */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            {activeWorkout
                                ? `Mashg'ulot: ${activeWorkout.name}`
                                : `Kun ${activeDay} uchun mashg'ulot`}
                        </h2>

                        {activeWorkout ? (
                            <>
                                {activeWorkout.description && (
                                    <div className="mb-6">
                                        <h3 className="font-medium text-gray-700 mb-2">
                                            Mashg'ulot haqida:
                                        </h3>
                                        <p className="text-gray-600">
                                            {activeWorkout.description}
                                        </p>
                                    </div>
                                )}

                                {activeWorkout.duration && (
                                    <div className="mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {activeWorkout.duration} daqiqa
                                        </span>
                                    </div>
                                )}

                                {activeWorkout.video_url && (
                                    <div className="aspect-w-16 aspect-h-9 mb-4">
                                        <iframe
                                            className="w-full h-[400px] rounded-lg"
                                            src={`https://www.youtube.com/embed/${
                                                activeWorkout.video_url.split(
                                                    "v="
                                                )[1]
                                            }`}
                                            title={`Hafta ${weekNum}, Kun ${activeDay} - ${activeWorkout.name} Mashg'uloti`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            onError={(e) =>
                                                console.error(
                                                    "Error loading YouTube video:",
                                                    e
                                                )
                                            }
                                        ></iframe>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-500 italic">
                                Bu kun uchun mashg'ulot ma'lumotlari mavjud
                                emas.
                            </p>
                        )}
                    </div>

                    {/* Meal Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            {activeMeal
                                ? `Ovqatlanish: ${activeMeal.name}`
                                : `Kun ${activeDay} uchun ovqatlanish rejasi`}
                        </h2>

                        {activeMeal ? (
                            <div className="space-y-6">
                                {activeMeal.description && (
                                    <div className="mb-4">
                                        <p className="text-gray-600">
                                            {activeMeal.description}
                                        </p>
                                    </div>
                                )}

                                {activeMeal.breakfast && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            Nonushta
                                        </h3>
                                        <div className="bg-yellow-50 p-4 rounded-md">
                                            <p className="whitespace-pre-line text-gray-700">
                                                {activeMeal.breakfast}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeMeal.lunch && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            Tushlik
                                        </h3>
                                        <div className="bg-green-50 p-4 rounded-md">
                                            <p className="whitespace-pre-line text-gray-700">
                                                {activeMeal.lunch}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeMeal.dinner && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            Kechki ovqat
                                        </h3>
                                        <div className="bg-blue-50 p-4 rounded-md">
                                            <p className="whitespace-pre-line text-gray-700">
                                                {activeMeal.dinner}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeMeal.snacks && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            Yengil tamaddi
                                        </h3>
                                        <div className="bg-purple-50 p-4 rounded-md">
                                            <p className="whitespace-pre-line text-gray-700">
                                                {activeMeal.snacks}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                Bu kun uchun ovqatlanish rejasi mavjud emas.
                            </p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {/* Week Overview */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Hafta tavsifi
                        </h2>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                                const hasWorkout = dailyWorkouts?.some(
                                    (w) => w.day_number === day
                                );
                                const hasMeal = dailyMeals?.some(
                                    (m) => m.day_number === day
                                );

                                return (
                                    <div
                                        key={day}
                                        className={`p-3 rounded-md cursor-pointer ${
                                            activeDay === day
                                                ? "bg-sky-100 border border-sky-200"
                                                : "hover:bg-gray-50 border border-gray-100"
                                        }`}
                                        onClick={() => setActiveDay(day)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span
                                                className={`font-medium ${
                                                    activeDay === day
                                                        ? "text-sky-800"
                                                        : "text-gray-800"
                                                }`}
                                            >
                                                Kun {day} -{" "}
                                                {daysOfWeek[day - 1]}
                                            </span>
                                            <div className="flex space-x-1">
                                                {hasWorkout && (
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-full bg-blue-500"
                                                        title="Mashg'ulot bor"
                                                    ></span>
                                                )}
                                                {hasMeal && (
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-full bg-green-500"
                                                        title="Ovqatlanish rejasi bor"
                                                    ></span>
                                                )}
                                            </div>
                                        </div>
                                        {workoutsByDay[day]?.[0]?.name && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {workoutsByDay[day][0].name}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mark as Completed Button */}
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        {weekProgress?.completed ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <p className="mt-2 text-lg font-medium text-gray-900">
                                    Hafta bajarildi!
                                </p>
                                <p className="text-sm text-gray-500">
                                    Siz bu haftani{" "}
                                    {new Date(
                                        weekProgress.completed_at
                                    ).toLocaleDateString()}{" "}
                                    kuni yakunladingiz
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-lg text-gray-600 mb-4">
                                    Bu haftadagi mashg'ulotlar va ovqatlanish
                                    rejasini bajardingizmi?
                                </p>
                                <button
                                    onClick={handleMarkAsCompleted}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Saqlanmoqda..."
                                        : "Bajarildi deb belgilash"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WeekPage;
