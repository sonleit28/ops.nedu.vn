import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient(
  env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
)
