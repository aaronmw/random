import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  const migrationSQL = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'hidden'
        AND enumtypid = (
          SELECT oid FROM pg_type WHERE typname = 'preset_visibility'
        )
      ) THEN
        ALTER TYPE public.preset_visibility ADD VALUE 'hidden';
      END IF;
    END $$;
  `

  console.log('Running migration to add "hidden" to preset_visibility enum...')

  let error: Error | null = null
  
  try {
    const result = await supabase.rpc('exec_sql', { sql: migrationSQL })
    if (result.error) {
      error = result.error
    }
  } catch (rpcError) {
    // If RPC doesn't exist, try direct query
    try {
      const { error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1)

      if (directError) {
        // Try using the postgres REST API directly
        if (!supabaseServiceKey) {
          error = new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
        } else {
          const headers = new Headers()
          headers.set('Content-Type', 'application/json')
          headers.set('apikey', supabaseServiceKey)
          headers.set('Authorization', `Bearer ${supabaseServiceKey}`)
          
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ sql: migrationSQL }),
          })

          if (!response.ok) {
            error = new Error(`HTTP ${response.status}: ${await response.text()}`)
          }
        }
      }
    } catch (fetchError) {
      error = fetchError instanceof Error ? fetchError : new Error(String(fetchError))
    }
  }

  if (error) {
    console.error('Error running migration:', error)
    console.log('\nPlease run this SQL manually in the Supabase Dashboard SQL Editor:')
    console.log(migrationSQL)
    process.exit(1)
  }

  console.log('Migration completed successfully!')
}

runMigration()
