import { supabase } from "./supabase";

export async function getCurrentSession() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("Error getting session:", error.message);
            return { session: null, error };
        }

        return { session: data.session, error: null };
    } catch (err) {
        console.error("Unexpected error getting session:", err);
        return { session: null, error: err };
    }
}

// Get user profile data from the database
export async function getUserProfile(userId) {
    if (!userId)
        return { profile: null, error: new Error("No user ID provided") };

    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error getting user profile:", error.message);
            return { profile: null, error };
        }

        return { profile: data, error: null };
    } catch (err) {
        console.error("Unexpected error getting user profile:", err);
        return { profile: null, error: err };
    }
}

// Check and refresh session if needed
export async function refreshSession() {
    try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
            console.error("Error refreshing session:", error.message);
            return { session: null, error };
        }

        return { session: data.session, error: null };
    } catch (err) {
        console.error("Unexpected error refreshing session:", err);
        return { session: null, error: err };
    }
}

// Force clear all authentication data (for troubleshooting)
export async function forceSignOut() {
    try {
        await supabase.auth.signOut({ scope: "global" });
        localStorage.clear(); // Clear any potential leftover auth data
        sessionStorage.clear();
        return { error: null };
    } catch (err) {
        console.error("Error during force sign out:", err);
        return { error: err };
    }
}
