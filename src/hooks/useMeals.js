import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export function useMeals(category) {
    return useQuery({
        queryKey: ["meals", category],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("meals")
                .select("*")
                .eq("category", category)
                .order("week", { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!category,
    });
}

export function useMealByWeek(category, week) {
    return useQuery({
        queryKey: ["meal", category, week],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("meals")
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
