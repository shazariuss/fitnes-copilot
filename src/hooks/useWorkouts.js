import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useWorkouts(category) {
    return useQuery({
        queryKey: ["workouts", category],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workouts")
                .select("*")
                .eq("category", category)
                .order("week", { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!category,
    });
}

export function useWorkoutByWeek(category, week) {
    return useQuery({
        queryKey: ["workout", category, week],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workouts")
                .select("*")
                .eq("category", category)
                .eq("week", parseInt(week))
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!category && !!week,
    });
}
