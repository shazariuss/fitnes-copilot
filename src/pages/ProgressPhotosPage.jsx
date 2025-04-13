import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";

function ProgressPhotosPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedMonth, setSelectedMonth] = useState("1");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // Fetch existing photos
    const { data: photos, isLoading } = useQuery({
        queryKey: ["progressPhotos", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase.storage
                .from("progress_photos")
                .list(`${user.id}`);

            if (error) throw error;

            if (!data || data.length === 0) return [];

            const photosWithUrls = await Promise.all(
                data.map(async (photo) => {
                    const { data: url } = supabase.storage
                        .from("progress_photos")
                        .getPublicUrl(`${user.id}/${photo.name}`);

                    // Extract month from filename (format: month-timestamp.jpg)
                    const month = photo.name.split("-")[0];

                    return {
                        ...photo,
                        month,
                        url: url?.publicUrl,
                    };
                })
            );

            return photosWithUrls;
        },
        enabled: !!user?.id,
    });

    // Upload photo mutation
    const uploadPhotoMutation = useMutation({
        mutationFn: async ({ file }) => {
            setUploading(true);
            setUploadError(null);

            try {
                const fileExt = file.name.split(".").pop();
                const fileName = `${selectedMonth}-${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error } = await supabase.storage
                    .from("progress_photos")
                    .upload(filePath, file, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (error) throw error;

                return fileName;
            } finally {
                setUploading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["progressPhotos", user?.id]);
        },
        onError: (error) => {
            console.error("Upload error:", error);
            setUploadError(error.message);
        },
    });

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const fileType = file.type;
        if (!fileType.startsWith("image/")) {
            setUploadError("Please select an image file");
            return;
        }

        uploadPhotoMutation.mutate({ file });
    };

    // Delete photo mutation
    const deletePhotoMutation = useMutation({
        mutationFn: async (fileName) => {
            const { error } = await supabase.storage
                .from("progress_photos")
                .remove([`${user.id}/${fileName}`]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["progressPhotos", user?.id]);
        },
        onError: (error) => {
            console.error("Delete error:", error);
            alert("Failed to delete photo. Please try again.");
        },
    });

    // Group photos by month
    const photosByMonth = (photos || []).reduce((acc, photo) => {
        const month = photo.month;
        if (!acc[month]) acc[month] = [];
        acc[month].push(photo);
        return acc;
    }, {});

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
                    Progress Photos
                </h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Upload New Photo
                </h2>

                {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                        {uploadError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Month
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="1">Month 1</option>
                            <option value="2">Month 2</option>
                            <option value="3">Month 3</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Choose Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        {uploading && (
                            <p className="mt-1 text-sm text-gray-500">
                                Uploading...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Your Progress Photos
                </h2>

                {Object.keys(photosByMonth).length === 0 ? (
                    <p className="text-gray-500 italic">
                        No progress photos uploaded yet.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {["1", "2", "3"].map((month) => (
                            <div
                                key={month}
                                className="border-t border-gray-200 pt-4 first:border-0 first:pt-0"
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Month {month}
                                </h3>

                                {photosByMonth[month]?.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {photosByMonth[month].map((photo) => (
                                            <div
                                                key={photo.name}
                                                className="relative group"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={`Month ${month} progress`}
                                                    className="h-40 w-full object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() =>
                                                        deletePhotoMutation.mutate(
                                                            photo.name
                                                        )
                                                    }
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete photo"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        No photos for Month {month}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProgressPhotosPage;
