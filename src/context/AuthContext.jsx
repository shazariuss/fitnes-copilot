import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This function handles both initial loading and auth state changes
        const setupAuth = async () => {
            try {
                // Attempt to get the current session
                const { data } = await supabase.auth.getSession();

                if (data?.session) {
                    // We have a session, try to get user data
                    try {
                        const { data: userData, error: userError } =
                            await supabase
                                .from("users")
                                .select("*")
                                .eq("id", data.session.user.id)
                                .single();

                        if (userError) {
                            console.error(
                                "Failed to fetch user data:",
                                userError.message
                            );
                            setUser(null);
                        } else {
                            setUser({
                                ...userData,
                                email: data.session.user.email,
                            });
                        }
                    } catch (err) {
                        console.error(
                            "Error fetching user profile:",
                            err.message
                        );
                        setUser(null);
                    }
                } else {
                    // No session found
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth initialization error:", err.message);
                setUser(null);
            } finally {
                // Always set loading to false regardless of what happened
                setLoading(false);
            }
        };

        // Run the setup immediately
        setupAuth();

        // Set up the auth state change listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                // We'll re-run the setup when these events occur
                setupAuth();
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setLoading(false);
            }
        });

        // Clean up the subscription
        return () => subscription?.unsubscribe();
    }, []);

    // Registration function
    const register = async (email, password, userData) => {
        // First create the auth user
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // Calculate BMI and assign category
        const heightInMeters = userData.height / 100;
        const bmi = userData.weight / (heightInMeters * heightInMeters);

        let category = userData.goal.toLowerCase().replace(" ", "_");

        // Override category based on BMI if needed
        if (bmi > 25 && category !== "lose_weight") {
            category = "lose_weight";
        } else if (bmi < 18.5 && category !== "gain_weight") {
            category = "gain_weight";
        } else if (bmi >= 18.5 && bmi <= 25 && category !== "stay_fit") {
            category = "stay_fit";
        }

        // Insert user data into our custom users table
        const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            name: userData.name,
            age: userData.age,
            gender: userData.gender,
            weight: userData.weight,
            height: userData.height,
            goal: userData.goal,
            category,
            created_at: new Date().toISOString(),
        });

        if (profileError) {
            // If profile creation fails, we should clean up the auth user
            await supabase.auth.signOut();
            throw profileError;
        }

        return { user: data.user, category };
    };

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Fetch user profile after login
            const { data: userData, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user.id)
                .single();

            if (profileError) {
                throw profileError;
            }

            setUser({ ...userData, email: data.user.email });
            return data;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Update profile function
    const updateProfile = async (updates) => {
        if (!user) throw new Error("User not authenticated");

        // Calculate BMI and category if weight or height changed
        let category = user.category;

        if (updates.weight && updates.height) {
            const heightInMeters = updates.height / 100;
            const bmi = updates.weight / (heightInMeters * heightInMeters);

            if (updates.goal) {
                category = updates.goal.toLowerCase().replace(" ", "_");

                // Override category based on BMI if needed
                if (bmi > 25 && category !== "lose_weight") {
                    category = "lose_weight";
                } else if (bmi < 18.5 && category !== "gain_weight") {
                    category = "gain_weight";
                } else if (
                    bmi >= 18.5 &&
                    bmi <= 25 &&
                    category !== "stay_fit"
                ) {
                    category = "stay_fit";
                }
            }
        }

        const { error } = await supabase
            .from("users")
            .update({
                ...updates,
                category,
            })
            .eq("id", user.id);

        if (error) throw error;

        // Update local user state
        setUser((prev) => ({ ...prev, ...updates, category }));

        return { ...user, ...updates, category };
    };

    // Reset Password function
    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
