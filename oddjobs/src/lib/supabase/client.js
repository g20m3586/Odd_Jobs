import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create the client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Export as named export
export const supabase = supabaseClient