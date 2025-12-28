import { Database } from '@/supabase/generated-types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  console.error('Please set up your environment variables:')
  console.error('1. Create a .env.local file in the project root')
  console.error('2. Add: NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('3. Add: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('You can find these values in your Supabase project dashboard under Settings > API')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

if (supabaseUrl && supabaseAnonKey) {
  console.log('Supabase client initialized with URL:', supabaseUrl)
} else {
  console.error('Supabase client not properly configured - some features may not work')
}

// Create client with fallback values to prevent crashes
export const supabaseClient = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'fallback-key',
)
