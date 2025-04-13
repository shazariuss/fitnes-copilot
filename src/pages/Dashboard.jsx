import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useProgress } from "../hooks/useProgress";
import { useWorkouts } from "../hooks/useWorkouts";
import { useMeals } from "../hooks/useMeals";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
    const { user } = useAuth();
    const [expandedMonth, setExpandedMonth] = useState(1);

    // Fetch data using custom hooks
    const { data: progress, isLoading: progressLoading } = useProgress(
        user?.id
    );
    const { data: workouts, isLoading: workoutsLoading } = useWorkouts(
        user?.category
    );
    const { data: meals, isLoading: mealsLoading } = useMeals(user?.category);

    // Loading state
    if (progressLoading || workoutsLoading || mealsLoading) {
        console.log(progressLoading, workoutsLoading, mealsLoading);

        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // Calculate progress percentage
    const completedWeeks = progress?.filter((p) => p.completed).length || 0;
    const progressPercentage = Math.round((completedWeeks / 12) * 100);

    // Chart data
    const chartData = {
        labels: ["Bajarildi", "Qoldi"],
        datasets: [
            {
                data: [completedWeeks, 12 - completedWeeks],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(211, 211, 211, 0.6)",
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(211, 211, 211, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        return label === "Completed"
                            ? `${label}: ${value} weeks`
                            : `${label}: ${value} weeks`;
                    },
                },
            },
        },
        cutout: "70%",
    };

    // Group weeks by month
    const months = [
        { month: 1, title: "Month 1", weeks: [1, 2, 3, 4] },
        { month: 2, title: "Month 2", weeks: [5, 6, 7, 8] },
        { month: 3, title: "Month 3", weeks: [9, 10, 11, 12] },
    ];

    // Get workout and meal for a specific week
    const getWorkoutForWeek = (weekNum) =>
        workouts?.find((w) => w.week === weekNum);
    const getMealForWeek = (weekNum) => meals?.find((m) => m.week === weekNum);
    const isWeekCompleted = (weekNum) =>
        progress?.some((p) => p.week === weekNum && p.completed);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Sizning Fitness Planingiz
            </h1>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Sizning Progress
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col items-center">
                        <div className="relative h-48 w-48">
                            <Doughnut data={chartData} options={chartOptions} />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-3xl font-bold">
                                    {progressPercentage}%
                                </p>
                                <p className="text-sm text-gray-500">
                                    Bajarildi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Umumiy Progres
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                                {completedWeeks}/12 hafta
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary-600 h-2.5 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <div className="mt-6">
                            <p className="text-sm text-gray-600 mb-2">
                                Sizning fitnes kategoriyangiz:{" "}
                                <span className="font-semibold capitalize">
                                    {user?.category?.replace("_", " ")}
                                </span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Sizning maqsadingiz:{" "}
                                <span className="font-semibold">
                                    {user?.goal}
                                </span>
                            </p>
                        </div>

                        <div className="mt-4">
                            <Link
                                to="/profile"
                                className="text-primary-600 hover:text-primary-800 font-medium text-sm inline-flex items-center"
                            >
                                Profilni yangilash
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Progesingizni kuzating
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary-50 p-5 rounded-lg flex flex-col items-center text-center hover:bg-primary-100 transition-colors">
                        <div className="text-primary-700 mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Bajarilgan Mashg'ulotlar
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Mashqlaringizni yozib boring va o'zgarishlarni
                            kuzating.
                        </p>
                        <Link
                            to="/workout-logs"
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm inline-flex items-center"
                        >
                            O'zgarishlarni ko'rish
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>

                    <div className="bg-primary-50 p-5 rounded-lg flex flex-col items-center text-center hover:bg-primary-100 transition-colors">
                        <div className="text-primary-700 mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Progres uchun suratlar
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Vizual o'zgarishingiz uchun suratlar yuklang
                        </p>
                        <Link
                            to="/progress-photos"
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm inline-flex items-center"
                        >
                            Rasmlarni ko'rish
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>

                    <div className="bg-primary-50 p-5 rounded-lg flex flex-col items-center text-center hover:bg-primary-100 transition-colors">
                        <div className="text-primary-700 mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Tana o'zgarishlari
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Vaqt mobaynida tana o'zgarishlarini kuzatib boring
                        </p>
                        <Link
                            to="/measurements"
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm inline-flex items-center"
                        >
                            O'zgarishlarni kuzatish
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Sizning 12-haftalik Rejangiz
                </h2>

                <div className="space-y-6">
                    {months.map((monthData) => (
                        <div
                            key={monthData.month}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <button
                                className="w-full px-6 py-4 bg-gray-50 flex justify-between items-center focus:outline-none"
                                onClick={() =>
                                    setExpandedMonth(
                                        expandedMonth === monthData.month
                                            ? null
                                            : monthData.month
                                    )
                                }
                            >
                                <h3 className="text-lg font-medium text-gray-900">
                                    {monthData.title}
                                </h3>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transform ${
                                        expandedMonth === monthData.month
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            {expandedMonth === monthData.month && (
                                <div className="px-6 py-4 divide-y divide-gray-200">
                                    {monthData.weeks.map((weekNum) => {
                                        const workout =
                                            getWorkoutForWeek(weekNum);
                                        const meal = getMealForWeek(weekNum);
                                        const completed =
                                            isWeekCompleted(weekNum);

                                        return (
                                            <div key={weekNum} className="py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {completed ? (
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                                                                <svg
                                                                    className="h-4 w-4 text-green-600"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        ) : (
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300">
                                                                <span className="text-xs font-medium text-gray-500">
                                                                    {weekNum}
                                                                </span>
                                                            </span>
                                                        )}
                                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                                            Hafta {weekNum}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={`/week/${weekNum}`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                                                    >
                                                        Detallarni ko'rish
                                                    </Link>
                                                </div>

                                                {workout && meal && (
                                                    <div className="mt-2 ml-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500">
                                                                Mashg'ulot
                                                            </p>
                                                            <p className="text-sm text-gray-900">
                                                                {workout.name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500">
                                                                Ovqat
                                                            </p>
                                                            <p className="text-sm text-gray-900">
                                                                {meal.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
