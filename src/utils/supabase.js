import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://rxyfxilbgfkgowheqjnj.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eWZ4aWxiZ2ZrZ293aGVxam5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzczMDQsImV4cCI6MjA1OTk1MzMwNH0.bYBdwszaYUabKdp7z3MToCud5TtoYnlAtOHg4lvzxwI";
export const supabase = createClient(supabaseUrl, supabaseKey);
