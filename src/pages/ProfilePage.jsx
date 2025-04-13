import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { calculateBMIAndCategory } from "../utils/bmiCalculator";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z
        .number()
        .int()
        .min(16, "You must be at least 16 years old")
        .max(100, "Age must be 100 or less"),
    gender: z.enum(["Male", "Female", "Other"]),
    weight: z.number().positive("Weight must be a positive number"),
    height: z.number().positive("Height must be a positive number"),
    goal: z.enum(["Lose Weight", "Gain Weight", "Stay Fit"]),
});

function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [bmiInfo, setBmiInfo] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            age: user?.age || "",
            gender: user?.gender || "Male",
            weight: user?.weight || "",
            height: user?.height || "",
            goal: user?.goal || "Stay Fit",
        },
    });

    // Calculate BMI on the fly when weight and height change
    const weight = watch("weight");
    const height = watch("height");
    const goal = watch("goal");

    const calculateBMI = () => {
        if (weight && height && goal) {
            const bmiData = calculateBMIAndCategory(
                parseFloat(weight),
                parseFloat(height),
                goal
            );
            setBmiInfo(bmiData);
        }
    };

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            // Calculate BMI and category
            const { bmi, category } = calculateBMIAndCategory(
                parseFloat(data.weight),
                parseFloat(data.height),
                data.goal
            );

            const { error } = await supabase
                .from("users")
                .update({
                    name: data.name,
                    age: parseInt(data.age),
                    gender: data.gender,
                    weight: parseFloat(data.weight),
                    height: parseFloat(data.height),
                    goal: data.goal,
                    category,
                })
                .eq("id", user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
            navigate("/dashboard");
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError("");

        try {
            await updateProfileMutation.mutateAsync(data);
        } catch (error) {
            console.error("Update profile error:", error);
            setServerError(
                error.message || "An error occurred while updating your profile"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Sizning profilingiz
                </h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-sky-600 hover:text-sky-800 font-medium"
                >
                    ← Dashboard
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {serverError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700">{serverError}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                FIO
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    type="text"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="age"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Yosh
                            </label>
                            <div className="mt-1">
                                <input
                                    id="age"
                                    type="number"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                    {...register("age", {
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.age && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.age.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="gender"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Jins
                            </label>
                            <div className="mt-1">
                                <select
                                    id="gender"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                    {...register("gender")}
                                >
                                    <option value="Male">Erkak</option>
                                    <option value="Female">Ayol</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="weight"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Vazn (kg)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="weight"
                                    type="number"
                                    step="0.1"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    {...register("weight", {
                                        valueAsNumber: true,
                                        onChange: calculateBMI,
                                    })}
                                />
                                {errors.weight && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.weight.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="height"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Bo'y (cm)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="height"
                                    type="number"
                                    step="0.1"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    {...register("height", {
                                        valueAsNumber: true,
                                        onChange: calculateBMI,
                                    })}
                                />
                                {errors.height && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.height.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="goal"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Fitnes maqsad
                            </label>
                            <div className="mt-1">
                                <select
                                    id="goal"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    {...register("goal", {
                                        onChange: calculateBMI,
                                    })}
                                >
                                    <option value="Lose Weight">
                                        Vazn tashlash
                                    </option>
                                    <option value="Gain Weight">
                                        Vazn olish
                                    </option>
                                    <option value="Stay Fit">
                                        Qomat saqlash
                                    </option>
                                </select>
                                {errors.goal && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.goal.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BMI Information Display */}
                    {bmiInfo && (
                        <div
                            className={`p-4 rounded-md ${
                                bmiInfo.isGoalMismatched
                                    ? "bg-yellow-50 border border-yellow-300"
                                    : "bg-green-50 border border-green-300"
                            }`}
                        >
                            <h3 className="text-sm font-medium">
                                Your BMI:{" "}
                                <span className="font-bold">{bmiInfo.bmi}</span>
                            </h3>

                            {bmiInfo.isGoalMismatched && (
                                <p className="text-sm mt-1">
                                    Based on your BMI, we recommend a{" "}
                                    <span className="font-bold">
                                        {bmiInfo.category.replace("_", " ")}{" "}
                                        plan
                                    </span>
                                    . Your progress will be optimized for this
                                    goal.
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                        >
                            {isLoading ? "Saqlash..." : "Yangilash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;
