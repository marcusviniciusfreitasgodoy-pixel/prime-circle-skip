import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Fallback to known values to prevent "supabaseUrl is required" runtime errors
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lortaowlmktdnttoykfl.supabase.co'
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcnRhb3dsbWt0ZG50dG95a2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDY5ODYsImV4cCI6MjA2MjcyMjk4Nn0.lM0TpuX2sbuIb2oOxJ99ZpO2X2rSrgJnZ3WtxJcd4gk'

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
