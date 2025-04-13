import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

function AdminPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("workout"); // 'workout' or 'meal'
    const [weekNumber, setWeekNumber] = useState(1);
    const [dayNumber, setDayNumber] = useState(1);
    const [category, setCategory] = useState("lose_weight");

    // Workout fields
    const [workoutName, setWorkoutName] = useState("");
    const [workoutDescription, setWorkoutDescription] = useState("");
    const [workoutVideoUrl, setWorkoutVideoUrl] = useState("");
    const [workoutDuration, setWorkoutDuration] = useState(30);

    // Meal fields
    const [mealName, setMealName] = useState("");
    const [mealDescription, setMealDescription] = useState("");
    const [breakfast, setBreakfast] = useState("");
    const [lunch, setLunch] = useState("");
    const [dinner, setDinner] = useState("");
    const [snacks, setSnacks] = useState("");

    // Save workout mutation
    const saveWorkoutMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from("daily_workouts").insert({
                week_number: parseInt(weekNumber),
                day_number: parseInt(dayNumber),
                category,
                name: workoutName,
                description: workoutDescription,
                video_url: workoutVideoUrl,
                duration: parseInt(workoutDuration),
            });

            if (error) throw error;
        },
        onSuccess: () => {
            alert("Mashg'ulot muvaffaqiyatli saqlandi!");
            setWorkoutName("");
            setWorkoutDescription("");
            setWorkoutVideoUrl("");
            setWorkoutDuration(30);
        },
        onError: (error) => {
            alert(`Xatolik yuz berdi: ${error.message}`);
        },
    });

    // Save meal mutation
    const saveMealMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from("daily_meals").insert({
                week_number: parseInt(weekNumber),
                day_number: parseInt(dayNumber),
                category,
                name: mealName,
                description: mealDescription,
                breakfast,
                lunch,
                dinner,
                snacks,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            alert("Ovqatlanish rejasi muvaffaqiyatli saqlandi!");
            setMealName("");
            setMealDescription("");
            setBreakfast("");
            setLunch("");
            setDinner("");
            setSnacks("");
        },
        onError: (error) => {
            alert(`Xatolik yuz berdi: ${error.message}`);
        },
    });

    // Handle form submissions
    const handleSubmitWorkout = (e) => {
        e.preventDefault();
        if (!workoutName) {
            alert("Iltimos, mashg'ulot nomini kiriting");
            return;
        }
        saveWorkoutMutation.mutate();
    };

    const handleSubmitMeal = (e) => {
        e.preventDefault();
        if (!mealName) {
            alert("Iltimos, ovqatlanish rejasi nomini kiriting");
            return;
        }
        saveMealMutation.mutate();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Admin Panel
                </h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    ← Bosh sahifaga qaytish
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setTab("workout")}
                                className={`${
                                    tab === "workout"
                                        ? "border-primary-500 text-primary-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Mashg'ulot qo'shish
                            </button>
                            <button
                                onClick={() => setTab("meal")}
                                className={`${
                                    tab === "meal"
                                        ? "border-primary-500 text-primary-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Ovqatlanish rejasi qo'shish
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hafta
                            </label>
                            <select
                                value={weekNumber}
                                onChange={(e) => setWeekNumber(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Hafta {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kun
                            </label>
                            <select
                                value={dayNumber}
                                onChange={(e) => setDayNumber(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                {[...Array(7)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Kun {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategoriya
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="lose_weight">
                                    Vazn yo'qotish
                                </option>
                                <option value="gain_weight">
                                    Vazn qo'shish
                                </option>
                                <option value="stay_fit">Formada qolish</option>
                            </select>
                        </div>
                    </div>
                </div>

                {tab === "workout" ? (
                    <form onSubmit={handleSubmitWorkout}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mashg'ulot nomi
                                </label>
                                <input
                                    type="text"
                                    value={workoutName}
                                    onChange={(e) =>
                                        setWorkoutName(e.target.value)
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Mashg'ulot nomini kiriting"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mashg'ulot tavsifi
                                </label>
                                <textarea
                                    value={workoutDescription}
                                    onChange={(e) =>
                                        setWorkoutDescription(e.target.value)
                                    }
                                    rows={3}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Mashg'ulot haqida qisqacha ma'lumot"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video URL (YouTube)
                                </label>
                                <input
                                    type="text"
                                    value={workoutVideoUrl}
                                    onChange={(e) =>
                                        setWorkoutVideoUrl(e.target.value)
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="https://www.youtube.com/embed/..."
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    YouTube embed URL kiriting, masalan:
                                    https://www.youtube.com/embed/dQw4w9WgXcQ
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mashg'ulot davomiyligi (daqiqa)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={workoutDuration}
                                    onChange={(e) =>
                                        setWorkoutDuration(e.target.value)
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saveWorkoutMutation.isPending}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    {saveWorkoutMutation.isPending
                                        ? "Saqlanmoqda..."
                                        : "Mashg'ulotni saqlash"}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitMeal}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ovqatlanish rejasi nomi
                                </label>
                                <input
                                    type="text"
                                    value={mealName}
                                    onChange={(e) =>
                                        setMealName(e.target.value)
                                    }
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Reja nomini kiriting"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Umumiy tavsif
                                </label>
                                <textarea
                                    value={mealDescription}
                                    onChange={(e) =>
                                        setMealDescription(e.target.value)
                                    }
                                    rows={2}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Ovqatlanish rejasi haqida qisqacha ma'lumot"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nonushta
                                </label>
                                <textarea
                                    value={breakfast}
                                    onChange={(e) =>
                                        setBreakfast(e.target.value)
                                    }
                                    rows={3}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Nonushta uchun tavsiya etilgan taomlar"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tushlik
                                </label>
                                <textarea
                                    value={lunch}
                                    onChange={(e) => setLunch(e.target.value)}
                                    rows={3}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Tushlik uchun tavsiya etilgan taomlar"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kechki ovqat
                                </label>
                                <textarea
                                    value={dinner}
                                    onChange={(e) => setDinner(e.target.value)}
                                    rows={3}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Kechki ovqat uchun tavsiya etilgan taomlar"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Yengil tamaddi
                                </label>
                                <textarea
                                    value={snacks}
                                    onChange={(e) => setSnacks(e.target.value)}
                                    rows={3}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Kun davomida yengil tamaddi uchun tavsiyalar"
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saveMealMutation.isPending}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    {saveMealMutation.isPending
                                        ? "Saqlanmoqda..."
                                        : "Ovqatlanish rejasini saqlash"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AdminPage;
