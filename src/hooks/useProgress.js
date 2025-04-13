import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useProgress(userId) {
    return useQuery({
        queryKey: ["progress", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("progress")
                .select("*")
                .eq("user_id", userId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userId,
    });
}

export function useWeekProgress(userId, week) {
    return useQuery({
        queryKey: ["weekProgress", userId, week],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("progress")
                .select("*")
                .eq("user_id", userId)
                .eq("week", parseInt(week))
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId && !!week,
    });
}

export function useMarkWeekCompleted(userId, week) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (isCompleted = true) => {
            // Check if progress entry exists
            const { data: existingProgress } = await supabase
                .from("progress")
                .select("id")
                .eq("user_id", userId)
                .eq("week", parseInt(week))
                .maybeSingle();

            if (existingProgress) {
                // Update existing entry
                const { error } = await supabase
                    .from("progress")
                    .update({
                        completed: isCompleted,
                        completed_at: isCompleted
                            ? new Date().toISOString()
                            : null,
                    })
                    .eq("id", existingProgress.id);

                if (error) throw error;
            } else {
                // Create new entry
                const { error } = await supabase.from("progress").insert({
                    user_id: userId,
                    week: parseInt(week),
                    completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                });

                if (error) throw error;
            }
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["progress", userId] });
            queryClient.invalidateQueries({
                queryKey: ["weekProgress", userId, week],
            });
        },
    });
}
