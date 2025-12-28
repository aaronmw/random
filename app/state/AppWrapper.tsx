'use client'

import { AppReducer, initialState } from '@/app/state/AppReducer'
import { AppState, PluginToAppMessage, PropertySettingsRow } from '@/app/types'
import { CrashScreen } from '@/components/CrashSreen'
import { ResizeHandle } from '@/components/ResizeHandle'
import {
  getAllPropertySettings,
  getUserPresets,
} from '@/lib/services/propertySettingsService'
import { supabaseClient } from '@/supabase/client'
import { useSearchParams } from 'next/navigation'
import {
  createContext,
  ReactNode,
  StrictMode,
  Suspense,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const AppContext = createContext<AppState>(initialState)

export function useAppContext() {
  return useContext(AppContext)
}

export function AppWrapper({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(AppReducer, initialState)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const figmaUserId = searchParams.get('figmaUserId')

  useEffect(() => {
    // Only set up realtime if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Skipping realtime setup - Supabase not properly configured')
      return () => {}
    }

    console.log('Setting up realtime subscription to:', supabaseUrl)
    console.log(
      'Supabase URL format check:',
      supabaseUrl?.includes('supabase.co')
        ? 'Valid production URL'
        : 'Invalid URL format',
    )
    console.log(
      'Anon key format check:',
      supabaseAnonKey?.startsWith('eyJ')
        ? 'Valid anon key format'
        : 'Invalid anon key format',
    )

    // Test basic database connection first
    const testConnection = async () => {
      try {
        console.log('Testing database connection...')
        // Try a simple query that should work regardless of table structure
        const { data, error } = await supabaseClient
          .from('property_settings')
          .select('*')
          .limit(0)

        if (error) {
          console.error('Database connection test failed:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })

          // Try an even simpler test with a different table
          console.log('Trying alternative connection test...')
          const { error: simpleError } = await supabaseClient
            .from('presets')
            .select('*')
            .limit(0)

          if (simpleError) {
            console.error('Alternative test also failed:', {
              message: simpleError.message,
              details: simpleError.details,
              hint: simpleError.hint,
              code: simpleError.code,
            })
          } else {
            console.log('Alternative test successful - presets table exists')
          }
        } else {
          console.log('Database connection test successful')
        }
      } catch (err) {
        console.error('Database connection test error:', err)
      }
    }

    testConnection()

    try {
      const channel = supabaseClient.channel('presets')

      channel
        .on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
          console.log('Change received!', payload)
          dispatch({
            type: 'handleDatabaseChange',
            payload: {
              table: payload.table as any,
              event: payload.eventType as any,
              new: payload.new,
              old: payload.old,
            },
          })
        })
        .subscribe((status, error) => {
          console.log('Realtime subscription status:', status)
          if (status === 'CHANNEL_ERROR') {
            console.error('Realtime subscription failed:', error)
            console.error('This might be due to:')
            console.error('- Network connectivity issues')
            console.error('- CORS configuration on the production database')
            console.error('- Realtime not enabled on the production database')
          } else if (status === 'SUBSCRIBED') {
            console.log('Realtime subscription successful')
          }
        })

      return () => {
        console.log('Cleaning up realtime subscription')
        supabaseClient.removeChannel(channel)
      }
    } catch (error) {
      console.error('Error setting up realtime subscription:', error)
      console.log('Realtime features will be disabled')
      return () => {}
    }
  }, [])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)

        console.log('Loading initial data...')
        const allPropertySettings = await getAllPropertySettings()
        console.log('Property settings loaded:', allPropertySettings.length)

        if (figmaUserId) {
          console.log('Loading user presets for user:', figmaUserId)
          const userPresets = await getUserPresets(figmaUserId)
          console.log('User presets loaded:', userPresets.length)

          dispatch({
            type: 'setInitialData',
            payload: {
              propertySettings: allPropertySettings,
              presets: userPresets,
              currentUserId: figmaUserId,
            },
          })
        } else {
          console.log('No Figma user ID, loading without user presets')
          dispatch({
            type: 'setInitialData',
            payload: {
              propertySettings: allPropertySettings,
              presets: [],
              currentUserId: null,
            },
          })
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
        // Even if there's an error, we should stop loading and show the app
        // with empty data rather than staying in loading state forever
        dispatch({
          type: 'setInitialData',
          payload: {
            propertySettings: [],
            presets: [],
            currentUserId: figmaUserId,
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [figmaUserId])

  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage:
          | PluginToAppMessage
          | { type: 'init'; payload: { figmaUserId: string } }
      }
    }) => {
      switch (event.data?.pluginMessage?.type) {
        case 'setSelectedNodePluginData': {
          const data = event.data.pluginMessage.payload
          dispatch({
            type: 'setSelectedNodePluginData',
            payload: {
              partialPropertySettings: data as Partial<PropertySettingsRow>,
            },
          })
          break
        }
      }
    }
  }, [])

  if (isLoading) {
    return (
      <StrictMode>
        <div className="bg-bg-secondary fixed inset-0 flex items-center justify-center">
          <div className="text-text">Loading!</div>
        </div>
      </StrictMode>
    )
  }

  return (
    <StrictMode>
      <AppContext
        value={{
          ...state,
          dispatch,
        }}
      >
        <div
          id="ui-container"
          className="fixed inset-0 grid"
        >
          <ErrorBoundary fallback={<CrashScreen />}>
            <Suspense fallback={null}>{children}</Suspense>
          </ErrorBoundary>
        </div>
        <ResizeHandle />
      </AppContext>
    </StrictMode>
  )
}
