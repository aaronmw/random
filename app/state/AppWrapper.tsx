'use client'

import { AppReducer, initialState } from '@/app/state/AppReducer'
import { AppState } from '@/app/types'
import { CrashScreen } from '@/components/CrashSreen'
import { NetworkActivitySpinner } from '@/components/NetworkActivitySpinner'
import { ResizeHandle } from '@/components/ResizeHandle'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { useInitialDataLoader } from '@/lib/hooks/useInitialDataLoader'
import { useMessageHandler } from '@/lib/hooks/useMessageHandler'
import { NetworkActivityProvider } from '@/lib/hooks/useNetworkActivity'
import { useRealtimeSubscriptions } from '@/lib/hooks/useRealtimeSubscriptions'
import { useSessionId } from '@/lib/hooks/useSessionId'
import { useUserOptionsPersistence } from '@/lib/hooks/useUserOptionsPersistence'
import { dispatchTestSignal } from '@/lib/utils/testSignals'
import { supabaseClient } from '@/supabase/client'
import { useSearchParams } from 'next/navigation'
import {
  createContext,
  ReactNode,
  StrictMode,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const AppContext = createContext<AppState>(initialState)

export function useAppContext() {
  return useContext(AppContext)
}

export function AppWrapper({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(AppReducer, initialState)
  const searchParams = useSearchParams()
  const hasLoadedInitialOptionsRef = useRef(false)
  const sessionId = useSessionId()
  const pendingUserOptionsUpdateRef = useRef<{
    timestamp: number
    values: {
      is_auto_scroll_enabled: boolean
      is_grouped_by_status: boolean
      is_grouped_by_type: boolean
      is_auto_load_from_selected_nodes: boolean
    }
  } | null>(null)
  // Use refs to store state values used in handleMessage to avoid stale closures
  const propertySettingsRef = useRef(state.propertySettings)
  const currentUserIdRef = useRef(state.currentUserId)
  const isAutoLoadFromSelectedNodesRef = useRef(
    state.isAutoLoadFromSelectedNodes,
  )
  const activePresetIdRef = useRef(state.activePresetId)

  useEffect(() => {
    propertySettingsRef.current = state.propertySettings
    currentUserIdRef.current = state.currentUserId
    isAutoLoadFromSelectedNodesRef.current = state.isAutoLoadFromSelectedNodes
    activePresetIdRef.current = state.activePresetId
  }, [
    state.propertySettings,
    state.currentUserId,
    state.isAutoLoadFromSelectedNodes,
    state.activePresetId,
  ])

  // Track if we've already requested initial selection to avoid doing it on every re-run
  const hasRequestedInitialSelectionRef = useRef(false)

  // Read figmaUserId from URL once and store in state
  const hasReadUrlRef = useRef(false)
  useEffect(() => {
    if (hasReadUrlRef.current) return // Only read once
    hasReadUrlRef.current = true

    const figmaUserIdFromUrl = searchParams.get('figmaUserId')
    if (figmaUserIdFromUrl && figmaUserIdFromUrl !== state.currentUserId) {
      console.log(
        'Reading figmaUserId from URL and storing in state:',
        figmaUserIdFromUrl,
      )
      dispatch({
        type: 'setStateByPath',
        payload: {
          path: 'currentUserId',
          value: figmaUserIdFromUrl,
        },
      })
    }
  }, [searchParams, state.currentUserId, dispatch])

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

    // Note: Generic subscription removed - we now have specific subscriptions for each table
    // This prevents duplicate events and allows better filtering
  }, [])

  const { isLoading: isLoadingFromHook } = useInitialDataLoader({
    currentUserId: state.currentUserId,
    dispatch,
  })
  const isLoading = isLoadingFromHook

  // Use extracted hooks for complex logic
  useRealtimeSubscriptions({
    currentUserId: state.currentUserId,
    dispatch,
    propertySettings: state.propertySettings,
    sessionId,
    pendingUserOptionsUpdateRef,
  })

  useMessageHandler({
    state,
    dispatch,
    propertySettingsRef,
    currentUserIdRef,
    isAutoLoadFromSelectedNodesRef,
    activePresetIdRef,
  })

  useUserOptionsPersistence({
    state,
    dispatch,
    isLoading,
    hasLoadedInitialOptionsRef,
    pendingUserOptionsUpdateRef,
    sessionId,
  })

  // Also request selection when app finishes loading
  useEffect(() => {
    if (!isLoading) {
      console.log('App finished loading, requesting current selection')
      dispatchPluginAction({ type: 'getCurrentSelection' })
    }
  }, [isLoading])

  // Mark initial options as loaded once isLoading becomes false and we have a user ID
  // Use a longer delay to ensure reducer has fully processed setInitialData
  useEffect(() => {
    if (
      !isLoading &&
      state.currentUserId &&
      !hasLoadedInitialOptionsRef.current
    ) {
      const timeoutId = setTimeout(() => {
        console.log('Marking initial options as loaded, enabling persistence')
        hasLoadedInitialOptionsRef.current = true

        // Dispatch app-fully-ready signal when ref is set and property settings are loaded
        if (
          state.propertySettings &&
          Object.keys(state.propertySettings).length > 0
        ) {
          dispatchTestSignal({ type: 'app-fully-ready' })
        }
      }, 100) // Small delay to ensure state has updated
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, state.currentUserId, state.propertySettings])

  // Track user settings changes and show loading state
  const prevGroupedByStatusRef = useRef(state.isGroupedByStatus)
  const prevGroupedByTypeRef = useRef(state.isGroupedByType)

  useEffect(() => {
    // Check if grouping settings changed
    const groupingChanged =
      prevGroupedByStatusRef.current !== state.isGroupedByStatus ||
      prevGroupedByTypeRef.current !== state.isGroupedByType

    if (groupingChanged && hasLoadedInitialOptionsRef.current) {
      // Set loading state
      dispatch({
        type: 'setUserSettingsChanging',
        payload: { isChanging: true },
      })

      // Clear loading state after a brief delay to allow re-render
      const timeoutId = setTimeout(() => {
        dispatch({
          type: 'setUserSettingsChanging',
          payload: { isChanging: false },
        })
      }, 100)

      // Update refs
      prevGroupedByStatusRef.current = state.isGroupedByStatus
      prevGroupedByTypeRef.current = state.isGroupedByType

      return () => clearTimeout(timeoutId)
    } else {
      // Update refs even if no change (for initial load)
      prevGroupedByStatusRef.current = state.isGroupedByStatus
      prevGroupedByTypeRef.current = state.isGroupedByType
    }
  }, [state.isGroupedByStatus, state.isGroupedByType, dispatch])

  // Dispatch test signals when user options change (after initial load)
  const prevUserOptionsRef = useRef<{
    isAutoScrollEnabled?: boolean
    isGroupedByStatus?: boolean
    isGroupedByType?: boolean
    isAutoLoadFromSelectedNodes?: boolean
  }>({})
  const hasInitializedRefsRef = useRef(false)

  useEffect(() => {
    // Only dispatch signals after initial load and when not loading
    if (isLoading || !hasLoadedInitialOptionsRef.current) {
      // Reset initialization flag when we become not ready
      hasInitializedRefsRef.current = false
      return
    }

    // Initialize refs when we first become ready
    if (!hasInitializedRefsRef.current) {
      prevUserOptionsRef.current = {
        isAutoScrollEnabled: state.isAutoScrollEnabled,
        isGroupedByStatus: state.isGroupedByStatus,
        isGroupedByType: state.isGroupedByType,
        isAutoLoadFromSelectedNodes: state.isAutoLoadFromSelectedNodes,
      }
      hasInitializedRefsRef.current = true
      return
    }

    // Check for changes and dispatch signals
    if (
      prevUserOptionsRef.current.isAutoScrollEnabled !==
      state.isAutoScrollEnabled
    ) {
      dispatchTestSignal({
        type: 'user-option-updated',
        optionName: 'isAutoScrollEnabled',
        value: state.isAutoScrollEnabled,
      })
    }
    if (
      prevUserOptionsRef.current.isGroupedByStatus !== state.isGroupedByStatus
    ) {
      dispatchTestSignal({
        type: 'user-option-updated',
        optionName: 'isGroupedByStatus',
        value: state.isGroupedByStatus,
      })
    }
    if (prevUserOptionsRef.current.isGroupedByType !== state.isGroupedByType) {
      dispatchTestSignal({
        type: 'user-option-updated',
        optionName: 'isGroupedByType',
        value: state.isGroupedByType,
      })
    }
    if (
      prevUserOptionsRef.current.isAutoLoadFromSelectedNodes !==
      state.isAutoLoadFromSelectedNodes
    ) {
      dispatchTestSignal({
        type: 'user-option-updated',
        optionName: 'isAutoLoadFromSelectedNodes',
        value: state.isAutoLoadFromSelectedNodes,
      })
    }

    // Update refs
    prevUserOptionsRef.current = {
      isAutoScrollEnabled: state.isAutoScrollEnabled,
      isGroupedByStatus: state.isGroupedByStatus,
      isGroupedByType: state.isGroupedByType,
      isAutoLoadFromSelectedNodes: state.isAutoLoadFromSelectedNodes,
    }
  }, [
    isLoading,
    state.isAutoScrollEnabled,
    state.isGroupedByStatus,
    state.isGroupedByType,
    state.isAutoLoadFromSelectedNodes,
  ])

  // Dispatch test signal after React has rendered (when loading completes)
  useEffect(() => {
    if (
      !isLoading &&
      state.propertySettings &&
      Object.keys(state.propertySettings).length > 0
    ) {
      // Use setTimeout to ensure this runs after React has rendered
      const timeoutId = setTimeout(() => {
        dispatchTestSignal({ type: 'app-initial-data-loaded' })

        // If ref is already set, also dispatch app-fully-ready
        if (hasLoadedInitialOptionsRef.current) {
          dispatchTestSignal({ type: 'app-fully-ready' })
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, state.propertySettings])

  // Sync body dark class with isLightMode state
  useEffect(() => {
    if (!isLoading) {
      document
        .querySelector('body')
        ?.classList.toggle('dark', !state.isLightMode)
    }
  }, [state.isLightMode, isLoading])

  // Memoize context value to prevent unnecessary re-renders
  // Must be called before any early returns to maintain hook order
  const contextValue = useMemo(
    () => ({
      ...state,
      dispatch,
    }),
    [state, dispatch],
  )

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
      <NetworkActivityProvider>
        <AppContext value={contextValue}>
          <div
            id="ui-container"
            className="fixed inset-0 grid"
          >
            <ErrorBoundary fallback={<CrashScreen />}>
              <Suspense
                fallback={
                  <div className="bg-bg-secondary fixed inset-0 flex items-center justify-center">
                    <div className="text-text">Loading...</div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </ErrorBoundary>
          </div>
          <ResizeHandle />
          <NetworkActivitySpinner />
        </AppContext>
      </NetworkActivityProvider>
    </StrictMode>
  )
}
