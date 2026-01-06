import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided')
}

/**
 * Supabaseクライアント
 * クライアント側・サーバー側の両方で使用可能
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
