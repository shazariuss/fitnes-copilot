import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { calculateBMIAndCategory } from "../utils/bmiCalculator";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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

function Register() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [bmiInfo, setBmiInfo] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            age: "",
            gender: "Male",
            weight: "",
            height: "",
            goal: "Stay Fit",
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

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError("");

        try {
            await registerUser(data.email, data.password, {
                name: data.name,
                age: parseInt(data.age),
                gender: data.gender,
                weight: parseFloat(data.weight),
                height: parseFloat(data.height),
                goal: data.goal,
            });

            navigate("/dashboard");
        } catch (error) {
            console.error("Registration error:", error);
            setServerError(
                error.message || "An error occurred during registration"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-bold text-gray-900">
                    Fitness Mentor
                </h1>
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                    Accaount oching
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {serverError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{serverError}</p>
                            </div>
                        )}

                        {/* Personal Information */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                F.I.O
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Parol
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Fitness Information */}
                        <div className="grid grid-cols-2 gap-4">
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
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        <div>
                            <label
                                htmlFor="goal"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Maqsad
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
                                        vazn olish
                                    </option>
                                    <option value="Stay Fit">
                                        Normada turish
                                    </option>
                                </select>
                                {errors.goal && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.goal.message}
                                    </p>
                                )}
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
                                    Sizning BMI:{" "}
                                    <span className="font-bold">
                                        {bmiInfo.bmi}
                                    </span>
                                </h3>

                                {bmiInfo.isGoalMismatched && (
                                    <p className="text-sm mt-1">
                                        Biz sizga maslahat beramiz:{" "}
                                        <span className="font-bold">
                                            {bmiInfo.category.replace("_", " ")}{" "}
                                            plan
                                        </span>
                                        . Sizning maqsadingiz shu bo'yicha
                                        optimizatsiya qilinadi
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {isLoading ? "Creating account..." : "Sign up"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <p className="text-center text-sm text-gray-600">
                            Akkauntingiz bormi{" "}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
