import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseDatabase } from '@/types/supabase'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Set PUBLIC_SUPABASE_URL/PUBLIC_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY.'
    )
  }

  return createBrowserClient<SupabaseDatabase>(
    supabaseUrl,
    supabaseAnonKey
  )
}
