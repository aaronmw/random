import { Database } from '@/supabase/generated-types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const errorMessage = `Missing required Supabase environment variables: ${missingVars.join(', ')}\n\n` +
    'Please set up your environment variables:\n' +
    '1. Create a .env.local file in the project root\n' +
    '2. Add: NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
    '3. Add: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n' +
    'You can find these values in your Supabase project dashboard under Settings > API'

  if (typeof window === 'undefined') {
    // Server-side: throw error
    throw new Error(errorMessage)
  } else {
    // Client-side: log error and throw
    console.error(errorMessage)
    throw new Error('Supabase configuration is required. Please check your environment variables.')
  }
}

console.log('Supabase client initialized with URL:', supabaseUrl)

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
)
