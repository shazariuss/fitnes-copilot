import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

function MeasurementsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [weight, setWeight] = useState("");
    const [chest, setChest] = useState("");
    const [waist, setWaist] = useState("");
    const [hips, setHips] = useState("");
    const [arms, setArms] = useState("");
    const [thighs, setThighs] = useState("");

    // Fetch existing measurements
    const { data: measurements, isLoading } = useQuery({
        queryKey: ["measurements", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("measurements")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.id,
    });

    // Save measurements mutation
    const saveMeasurementsMutation = useMutation({
        mutationFn: async () => {
            const measurementData = {
                user_id: user.id,
                weight: weight ? parseFloat(weight) : null,
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null,
                arms: arms ? parseFloat(arms) : null,
                thighs: thighs ? parseFloat(thighs) : null,
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("measurements")
                .insert(measurementData);

            if (error) throw error;

            // Reset form
            setWeight("");
            setChest("");
            setWaist("");
            setHips("");
            setArms("");
            setThighs("");
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["measurements", user?.id]);
        },
        onError: (error) => {
            console.error("Error saving measurements:", error);
            alert("Failed to save measurements. Please try again.");
        },
    });

    // Delete measurement mutation
    const deleteMeasurementMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from("measurements")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["measurements", user?.id]);
        },
        onError: (error) => {
            console.error("Error deleting measurement:", error);
            alert("Failed to delete measurement. Please try again.");
        },
    });

    // Prepare chart data
    const prepareChartData = (metric) => {
        if (!measurements || measurements.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        label: metric.charAt(0).toUpperCase() + metric.slice(1),
                        data: [],
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                        tension: 0.1,
                    },
                ],
            };
        }

        const labels = measurements.map((m) => {
            const date = new Date(m.created_at);
            return date.toLocaleDateString();
        });

        const data = measurements.map((m) => m[metric]);

        return {
            labels,
            datasets: [
                {
                    label: metric.charAt(0).toUpperCase() + metric.slice(1),
                    data,
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                    tension: 0.1,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Your Progress Over Time",
            },
        },
        scales: {
            y: {
                beginAtZero: false,
            },
        },
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if at least one measurement is provided
        if (!weight && !chest && !waist && !hips && !arms && !thighs) {
            alert("Please enter at least one measurement");
            return;
        }

        saveMeasurementsMutation.mutate();
    };

    if (isLoading) {
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
                    Tana o'lchovlari o'zgarishi
                </h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    ← Dashboard
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Yangi o'zgarish qo'shish
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vazn (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 70.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ko'krak (cm)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={chest}
                                onChange={(e) => setChest(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 95.0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bel (cm)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={waist}
                                onChange={(e) => setWaist(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 80.0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dumba (cm)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={hips}
                                onChange={(e) => setHips(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 100.0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Qo'llar (cm)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={arms}
                                onChange={(e) => setArms(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 35.0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sonlar (cm)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={thighs}
                                onChange={(e) => setThighs(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 55.0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saveMeasurementsMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {saveMeasurementsMutation.isPending
                                ? "Saving..."
                                : "Save Measurements"}
                        </button>
                    </div>
                </form>
            </div>

            {measurements && measurements.length > 0 && (
                <>
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Progress Charts
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <Line
                                    data={prepareChartData("weight")}
                                    options={chartOptions}
                                />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <Line
                                    data={prepareChartData("waist")}
                                    options={chartOptions}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            O'zgarishlar tarixi
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sana
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vazn (kg)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ko'krak (cm)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bel (cm)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dumba (cm)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Qo'llar (cm)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Son (cm)
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harakatlar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {measurements
                                        .slice()
                                        .reverse()
                                        .map((measurement) => (
                                            <tr key={measurement.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(
                                                        measurement.created_at
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {measurement.weight || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {measurement.chest || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {measurement.waist || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {measurement.hips || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {measurement.arms || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {measurement.thighs || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() =>
                                                            deleteMeasurementMutation.mutate(
                                                                measurement.id
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
                    </div>
                </>
            )}
        </div>
    );
}

export default MeasurementsPage;
