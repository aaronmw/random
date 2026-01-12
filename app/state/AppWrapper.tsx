'use client'

import { AppReducer, initialState } from '@/app/state/AppReducer'
import { AppState, PluginToAppMessage, PropertySettingsRow } from '@/app/types'
import { CrashScreen } from '@/components/CrashSreen'
import { NetworkActivitySpinner } from '@/components/NetworkActivitySpinner'
import { ResizeHandle } from '@/components/ResizeHandle'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import { NetworkActivityProvider } from '@/lib/hooks/useNetworkActivity'
import { useSessionId } from '@/lib/hooks/useSessionId'
import {
  bulkPopulatePreset,
  getAllPropertySettings,
  getLocalPresetId,
  getOrCreateLocalPreset,
  getUserPresets,
  loadPreset,
} from '@/lib/services/propertySettingsService'
import {
  getOrCreateUserOptions,
  updateUserOptions,
} from '@/lib/services/userOptionsService'
import { getAdminUserId } from '@/lib/utils/getAdminUserId'
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
  useReducer,
  useRef,
  useState,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const AppContext = createContext<AppState>(initialState)

export function useAppContext() {
  return useContext(AppContext)
}

// Helper function to load a preset by ID
async function loadPresetFromId(
  presetId: string,
  currentUserId: string,
  dispatch: React.Dispatch<any>,
  propertySettings: Record<string, any>,
) {
  // Defensive check - ensure propertySettings is valid
  if (!propertySettings || typeof propertySettings !== 'object') {
    console.error(
      'Invalid propertySettings in loadPresetFromId:',
      propertySettings,
    )
    return
  }
  // Set loading state
  dispatch({
    type: 'setPresetLoading',
    payload: { isLoading: true },
  })

  // Set this preset as active
  dispatch({
    type: 'setActivePresetId',
    payload: {
      presetId,
    },
  })

  // Clear found preset ID since we're loading it
  dispatch({
    type: 'setFoundPresetId',
    payload: {
      presetId: null,
    },
  })

  try {
    // Load the preset from database
    const presetPropertySettings = await loadPreset(presetId)

    // Map loaded preset settings to use local preset IDs (from current state)
    // This avoids a database write/read cycle
    const mappedPropertySettings = presetPropertySettings.map((loadedPs) => {
      const localPs = propertySettings[loadedPs.label]
      if (localPs) {
        // Use local preset's ID and preset_id, but copy all other fields from loaded preset
        return {
          ...loadedPs,
          id: localPs.id,
          preset_id: localPs.preset_id,
        }
      }
      // If property doesn't exist in local preset, use loaded preset as-is
      // (This shouldn't happen, but handle it gracefully)
      return loadedPs
    })

    // Dispatch action to load preset - this will disable non-loaded properties and merge settings
    dispatch({
      type: 'loadPreset',
      payload: {
        presetPropertySettings: mappedPropertySettings,
      },
    })

    // Clear loading state
    dispatch({
      type: 'setPresetLoading',
      payload: { isLoading: false },
    })
  } catch (error) {
    console.error('Error loading preset:', error)
    dispatch({
      type: 'setPresetLoading',
      payload: { isLoading: false },
    })
  }
}

export function AppWrapper({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(AppReducer, initialState)
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)

        console.log('Loading initial data...')

        // Use currentUserId from state (which may be set from URL or plugin)
        // Also check URL params directly to avoid race conditions with URL-reading useEffect
        const urlParams =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null
        const figmaUserIdFromUrl = urlParams?.get('figmaUserId') || null
        let userIdToUse = state.currentUserId || figmaUserIdFromUrl || null

        // If still null in dev mode, use admin user ID; otherwise load global templates
        if (!userIdToUse && process.env.NODE_ENV === 'development') {
          const adminUserId = getAdminUserId()
          if (adminUserId) {
            userIdToUse = adminUserId
            console.log(
              'No user ID found, using admin user ID for dev mode:',
              adminUserId,
            )
          }
        }

        console.log('User ID:', {
          currentUserId: state.currentUserId,
          figmaUserIdFromUrl,
          userIdToUse,
        })

        if (userIdToUse) {
          // Load local preset for user
          console.log('Loading local preset for user:', userIdToUse)
          const localPreset = await getOrCreateLocalPreset(userIdToUse)
          const localPresetId = localPreset.id
          let propertySettings = await loadPreset(localPresetId)

          // If local preset is empty, populate it from default preset
          if (propertySettings.length === 0) {
            console.log(
              'Local preset is empty, populating from default preset...',
            )

            // Get default preset
            const { data: defaultPreset, error: defaultError } =
              await supabaseClient
                .from('presets')
                .select('*')
                .eq('figma_user_id', 'default')
                .eq('label', '__default__')
                .maybeSingle()

            if (defaultError || !defaultPreset) {
              console.error(
                'Default preset not found. Please ensure seed.sql has been executed.',
                defaultError,
              )
              // Continue with empty property settings - user will need to factory reset
            } else {
              // Load default preset's property settings
              const defaultSettings = await loadPreset(defaultPreset.id)

              if (defaultSettings.length > 0) {
                // Populate local preset with default settings using bulk inserts
                await bulkPopulatePreset(
                  localPresetId,
                  userIdToUse,
                  defaultSettings,
                )

                // Reload the local preset's property settings
                propertySettings = await loadPreset(localPresetId)
                console.log(
                  'Local preset populated with',
                  propertySettings.length,
                  'property settings from default preset',
                )
              }
            }
          }

          // Verify all property settings belong to the local preset
          const wrongPresetSettings = propertySettings.filter(
            (ps) => ps.preset_id !== localPresetId,
          )
          if (wrongPresetSettings.length > 0) {
            console.error(
              'CRITICAL: Found property settings with wrong preset_id:',
              {
                localPresetId,
                wrongPresetSettings: wrongPresetSettings.map((ps) => ({
                  label: ps.label,
                  id: ps.id,
                  preset_id: ps.preset_id,
                })),
              },
            )
            // Filter out wrong preset settings to prevent errors
            const correctPropertySettings = propertySettings.filter(
              (ps) => ps.preset_id === localPresetId,
            )
            console.log('Filtered property settings:', {
              originalCount: propertySettings.length,
              correctCount: correctPropertySettings.length,
              removedCount: wrongPresetSettings.length,
            })
            propertySettings = correctPropertySettings
          }

          // Log opacity setting for debugging
          const opacitySetting = propertySettings.find(
            (ps) => ps.label === 'opacity',
          )
          console.log('Initial load - property settings:', {
            localPresetId,
            propertySettingsCount: propertySettings.length,
            opacityId: opacitySetting?.id,
            opacityPresetId: opacitySetting?.preset_id,
            opacityEnabled: opacitySetting?.is_enabled,
            allPresetIds: propertySettings
              .map((ps) => ({
                label: ps.label,
                id: ps.id,
                preset_id: ps.preset_id,
              }))
              .slice(0, 5),
          })

          console.log('Loading user presets for user:', userIdToUse)
          const userPresets = await getUserPresets(userIdToUse)
          console.log('User presets loaded:', userPresets.length)

          // Load user options (may be null if table doesn't exist yet)
          let userOptions = await getOrCreateUserOptions(userIdToUse)

          // Check if isLightMode is provided in query string (from Figma)
          const isLightModeFromQuery = searchParams.get('isLightMode')
          if (isLightModeFromQuery !== null) {
            const isLightModeValue = isLightModeFromQuery === 'true'

            // Update database if value differs from stored value
            if (userOptions && userOptions.is_light_mode !== isLightModeValue) {
              console.log('Updating isLightMode from Figma query string:', {
                old: userOptions.is_light_mode,
                new: isLightModeValue,
              })
              userOptions = await updateUserOptions(userIdToUse, {
                is_light_mode: isLightModeValue,
              })
            } else if (!userOptions) {
              // Create user options with isLightMode if they don't exist
              userOptions = await getOrCreateUserOptions(userIdToUse)
              if (
                userOptions &&
                userOptions.is_light_mode !== isLightModeValue
              ) {
                userOptions = await updateUserOptions(userIdToUse, {
                  is_light_mode: isLightModeValue,
                })
              }
            }
          }

          console.log('📥 User options loaded from database:', {
            exists: !!userOptions,
            values: userOptions
              ? {
                  is_auto_scroll_enabled: userOptions.is_auto_scroll_enabled,
                  is_grouped_by_status: userOptions.is_grouped_by_status,
                  is_grouped_by_type: userOptions.is_grouped_by_type,
                  is_light_mode: userOptions.is_light_mode,
                }
              : null,
          })

          dispatch({
            type: 'setInitialData',
            payload: {
              propertySettings,
              presets: userPresets,
              currentUserId: userIdToUse,
              userOptions: userOptions
                ? {
                    isAutoScrollEnabled: userOptions.is_auto_scroll_enabled,
                    isGroupedByStatus: userOptions.is_grouped_by_status,
                    isGroupedByType: userOptions.is_grouped_by_type,
                    isLightMode: userOptions.is_light_mode,
                    isAutoLoadFromSelectedNodes:
                      userOptions.is_auto_load_from_selected_nodes,
                  }
                : undefined,
            },
          })
          console.log(
            '📤 setInitialData dispatched with userOptions:',
            userOptions
              ? {
                  isAutoScrollEnabled: userOptions.is_auto_scroll_enabled,
                  isGroupedByStatus: userOptions.is_grouped_by_status,
                  isGroupedByType: userOptions.is_grouped_by_type,
                  isLightMode: userOptions.is_light_mode,
                }
              : 'undefined',
          )
        } else {
          // No user ID - load global templates (for admin/default preset management)
          console.log('No Figma user ID, loading global templates')
          const allPropertySettings = await getAllPropertySettings()
          console.log('Property settings loaded:', allPropertySettings.length)

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
            currentUserId: state.currentUserId || null,
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentUserId])

  // Track the local preset ID to re-establish subscription when it changes
  const localPresetIdRef = useRef<string | null>(null)
  const subscriptionChannelRef = useRef<ReturnType<
    typeof supabaseClient.channel
  > | null>(null)

  // Set up real-time subscription for local preset property settings
  useEffect(() => {
    if (!state.currentUserId) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return () => {}
    }

    const setupLocalPresetSubscription = async () => {
      try {
        const localPresetId = await getLocalPresetId(state.currentUserId!)
        if (!localPresetId) {
          console.log('Local preset not found, skipping subscription')
          localPresetIdRef.current = null
          return
        }

        // If preset ID hasn't changed, don't re-subscribe
        if (localPresetIdRef.current === localPresetId) {
          console.log(
            'Local preset ID unchanged, keeping existing subscription',
          )
          return
        }

        // Clean up old subscription if preset ID changed
        if (
          localPresetIdRef.current !== null &&
          subscriptionChannelRef.current
        ) {
          console.log('Preset ID changed, cleaning up old subscription')
          supabaseClient.removeChannel(subscriptionChannelRef.current)
          subscriptionChannelRef.current = null
        }

        localPresetIdRef.current = localPresetId
        const currentPresetId = localPresetId // Capture for use in handlers

        const channel = supabaseClient.channel(
          `local-preset-${state.currentUserId}-${localPresetId}`,
        )
        subscriptionChannelRef.current = channel

        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'property_settings',
              filter: `preset_id=eq.${currentPresetId}`,
            },
            (payload) => {
              // Double-check that this event is for the correct preset
              const eventPresetId =
                (payload.new as any)?.preset_id ||
                (payload.old as any)?.preset_id
              if (eventPresetId !== currentPresetId) {
                console.warn(
                  'Ignoring property_settings event for wrong preset:',
                  {
                    eventPresetId,
                    expectedPresetId: currentPresetId,
                    event: payload.eventType,
                    label:
                      (payload.new as any)?.label ||
                      (payload.old as any)?.label,
                  },
                )
                return
              }

              console.log('Local preset property setting changed:', {
                event: payload.eventType,
                newPresetId: (payload.new as any)?.preset_id,
                oldPresetId: (payload.old as any)?.preset_id,
                newId: (payload.new as any)?.id,
                oldId: (payload.old as any)?.id,
                label:
                  (payload.new as any)?.label || (payload.old as any)?.label,
                expectedPresetId: currentPresetId,
              })
              dispatch({
                type: 'handleDatabaseChange',
                payload: {
                  table: 'property_settings',
                  event: payload.eventType as any,
                  new: payload.new,
                  old: payload.old,
                },
              })
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'numeric_property_settings',
            },
            async (payload) => {
              console.log('Numeric property settings changed:', payload)
              // Find the property setting that this numeric setting belongs to
              const propertySettingId =
                (payload.new as any)?.property_setting_id ||
                (payload.old as any)?.property_setting_id
              const { data: propertySetting } = await supabaseClient
                .from('property_settings')
                .select('label, preset_id')
                .eq('id', propertySettingId)
                .single()

              // Use ref value to check against current preset ID
              if (
                propertySetting &&
                propertySetting.preset_id === localPresetIdRef.current
              ) {
                console.log('Dispatching numeric_property_settings update:', {
                  label: propertySetting.label,
                  newData: payload.new,
                })
                dispatch({
                  type: 'handleDatabaseChange',
                  payload: {
                    table: 'numeric_property_settings',
                    event: payload.eventType as any,
                    new: { ...payload.new, label: propertySetting.label },
                    old: payload.old,
                  },
                })
              }
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'text_property_settings',
            },
            async (payload) => {
              console.log('Text property settings changed:', payload)
              // Find the property setting that this text setting belongs to
              const { data: propertySetting } = await supabaseClient
                .from('property_settings')
                .select('label, preset_id')
                .eq(
                  'id',
                  (payload.new as any)?.property_setting_id ||
                    (payload.old as any)?.property_setting_id,
                )
                .single()

              // Use ref value to check against current preset ID
              if (
                propertySetting &&
                propertySetting.preset_id === localPresetIdRef.current
              ) {
                dispatch({
                  type: 'handleDatabaseChange',
                  payload: {
                    table: 'text_property_settings',
                    event: payload.eventType as any,
                    new: { ...payload.new, label: propertySetting.label },
                    old: payload.old,
                  },
                })
              }
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'dimension_property_settings',
            },
            async (payload) => {
              console.log('Dimension property settings changed:', payload)
              // Find the property setting that this dimension setting belongs to
              const { data: propertySetting } = await supabaseClient
                .from('property_settings')
                .select('label, preset_id')
                .eq(
                  'id',
                  (payload.new as any)?.property_setting_id ||
                    (payload.old as any)?.property_setting_id,
                )
                .single()

              // Use ref value to check against current preset ID
              if (
                propertySetting &&
                propertySetting.preset_id === localPresetIdRef.current
              ) {
                dispatch({
                  type: 'handleDatabaseChange',
                  payload: {
                    table: 'dimension_property_settings',
                    event: payload.eventType as any,
                    new: { ...payload.new, label: propertySetting.label },
                    old: payload.old,
                  },
                })
              }
            },
          )
          .subscribe((status, error?: Error | string | null) => {
            if (status === 'SUBSCRIBED') {
              console.log('Local preset subscription active')
            } else if (status === 'CHANNEL_ERROR') {
              // Connection errors after sleep/wake are expected and Supabase will auto-reconnect
              const isConnectionError =
                !error ||
                (typeof error === 'string' &&
                  error.toLowerCase().includes('connection')) ||
                (error &&
                  typeof error === 'object' &&
                  'message' in error &&
                  typeof (error as { message: unknown }).message === 'string' &&
                  (error as { message: string }).message
                    .toLowerCase()
                    .includes('connection'))

              if (isConnectionError) {
                console.warn(
                  'Local preset subscription connection error (will auto-reconnect):',
                  error,
                )
              } else {
                console.error('Local preset subscription error:', error)
              }
            }
          })
      } catch (error) {
        console.error('Error setting up local preset subscription:', error)
      }
    }

    // Initial setup and re-check when propertySettings change (e.g., after Factory Reset)
    // This ensures the subscription re-establishes with the new preset ID if it changed
    setupLocalPresetSubscription()

    return () => {
      if (subscriptionChannelRef.current) {
        console.log('Cleaning up local preset subscription')
        supabaseClient.removeChannel(subscriptionChannelRef.current)
        subscriptionChannelRef.current = null
        localPresetIdRef.current = null
      }
    }
  }, [state.currentUserId, dispatch, state.propertySettings])

  // Set up real-time subscription for presets
  // Subscribe to: user's own presets + all public presets
  useEffect(() => {
    if (!state.currentUserId) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return () => {}
    }

    const channel = supabaseClient.channel(`presets-${state.currentUserId}`)

    // Subscribe to user's own presets
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'presets',
        filter: `figma_user_id=eq.${state.currentUserId}`,
      },
      (payload) => {
        console.log('User preset changed via realtime:', {
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old,
          newLabel:
            payload.new &&
            typeof payload.new === 'object' &&
            'label' in payload.new
              ? (payload.new as { label: unknown }).label
              : undefined,
          oldLabel:
            payload.old &&
            typeof payload.old === 'object' &&
            'label' in payload.old
              ? (payload.old as { label: unknown }).label
              : undefined,
        })
        dispatch({
          type: 'handleDatabaseChange',
          payload: {
            table: 'presets',
            event: payload.eventType as any,
            new: payload.new,
            old: payload.old,
          },
        })
      },
    )

    // Subscribe to all public presets (from any user)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'presets',
        filter: `visibility=eq.public`,
      },
      (payload) => {
        // For DELETE events, check old data; for INSERT/UPDATE, check new data
        // Only process if it's not the user's own preset (already handled above)
        const isUserOwnPreset =
          payload.eventType === 'DELETE'
            ? (payload.old as any)?.figma_user_id === state.currentUserId
            : (payload.new as any)?.figma_user_id === state.currentUserId

        if (!isUserOwnPreset) {
          console.log(
            'Public preset changed via realtime (accumulating):',
            payload,
          )
          dispatch({
            type: 'addPendingPublicPresetChange',
            payload: {
              table: 'presets',
              event: payload.eventType as any,
              new: payload.new,
              old: payload.old,
            },
          })
        }
      },
    )

    channel.subscribe((status, error?: Error | string | null) => {
      if (status === 'SUBSCRIBED') {
        console.log('Presets subscription active')
      } else if (status === 'CHANNEL_ERROR') {
        // Connection errors after sleep/wake are expected and Supabase will auto-reconnect
        const isConnectionError =
          !error ||
          (typeof error === 'string' &&
            error.toLowerCase().includes('connection')) ||
          (error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof (error as { message: unknown }).message === 'string' &&
            (error as { message: string }).message
              .toLowerCase()
              .includes('connection'))

        if (isConnectionError) {
          console.warn(
            'Presets subscription connection error (will auto-reconnect):',
            error,
          )
        } else {
          console.error('Presets subscription error:', error)
        }
      }
    })

    return () => {
      console.log('Cleaning up presets subscription')
      supabaseClient.removeChannel(channel)
    }
  }, [state.currentUserId, dispatch])

  // Set up real-time subscription for user options
  useEffect(() => {
    if (!state.currentUserId) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return () => {}
    }

    const channel = supabaseClient.channel(
      `user-options-${state.currentUserId}`,
    )

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_options',
          filter: `figma_user_id=eq.${state.currentUserId}`,
        },
        (payload) => {
          console.log('User options changed via realtime:', payload)

          // Check if this is our own update by comparing with pending update
          if (pendingUserOptionsUpdateRef.current) {
            const { timestamp, values } = pendingUserOptionsUpdateRef.current
            const payloadTimestamp = payload.commit_timestamp
              ? new Date(payload.commit_timestamp).getTime()
              : Date.now()

            // If update is very recent (within 2 seconds) and values match, it's likely ours
            const timeDiff = Math.abs(payloadTimestamp - timestamp)
            const valuesMatch =
              (payload.new as any)?.is_auto_scroll_enabled ===
                values.is_auto_scroll_enabled &&
              (payload.new as any)?.is_grouped_by_status ===
                values.is_grouped_by_status &&
              (payload.new as any)?.is_grouped_by_type ===
                values.is_grouped_by_type &&
              (payload.new as any)?.is_auto_load_from_selected_nodes ===
                values.is_auto_load_from_selected_nodes

            if (timeDiff < 2000 && valuesMatch) {
              console.log(
                'Ignoring own user options update (change source tracking)',
                {
                  timeDiff,
                  valuesMatch,
                  sessionId,
                },
              )
              // Clear pending update after processing
              pendingUserOptionsUpdateRef.current = null
              return
            }

            // If it's been more than 2 seconds, clear the pending update
            if (timeDiff >= 2000) {
              pendingUserOptionsUpdateRef.current = null
            }
          }

          dispatch({
            type: 'handleDatabaseChange',
            payload: {
              table: 'user_options',
              event: payload.eventType as any,
              new: payload.new,
              old: payload.old,
            },
          })
        },
      )
      .subscribe((status, error?: Error | string | null) => {
        if (status === 'SUBSCRIBED') {
          console.log('User options subscription active')
        } else if (status === 'CHANNEL_ERROR') {
          // Connection errors after sleep/wake are expected and Supabase will auto-reconnect
          const isConnectionError =
            !error ||
            (typeof error === 'string' &&
              error.toLowerCase().includes('connection')) ||
            (error &&
              typeof error === 'object' &&
              'message' in error &&
              typeof (error as { message: unknown }).message === 'string' &&
              (error as { message: string }).message
                .toLowerCase()
                .includes('connection'))

          if (isConnectionError) {
            console.warn(
              'User options subscription connection error (will auto-reconnect):',
              error,
            )
          } else {
            console.error('User options subscription error:', error)
          }
        }
      })

    return () => {
      console.log('Cleaning up user options subscription')
      supabaseClient.removeChannel(channel)
    }
  }, [state.currentUserId, dispatch, sessionId])

  useEffect(
    () => {
      // Synchronous logging to catch errors before page crashes
      console.log('[DEBUG] Message handler useEffect starting', {
        hasState: !!state,
        hasDispatch: !!dispatch,
        currentUserId: state?.currentUserId,
        isAutoLoadFromSelectedNodes: state?.isAutoLoadFromSelectedNodes,
      })

      // Defensive check - ensure state and dispatch are valid
      if (!state || !dispatch) {
        console.error(
          '[DEBUG] Invalid state or dispatch in message handler setup',
        )
        return
      }

      // Ensure refs are initialized with current state values
      // This prevents using stale values if the effect runs before refs are updated
      // Use defensive checks to ensure values are valid
      try {
        if (state.propertySettings) {
          propertySettingsRef.current = state.propertySettings
        }
        if (state.currentUserId !== undefined && state.currentUserId !== null) {
          currentUserIdRef.current = state.currentUserId
        }
        if (state.isAutoLoadFromSelectedNodes !== undefined) {
          isAutoLoadFromSelectedNodesRef.current =
            state.isAutoLoadFromSelectedNodes
        }
        if (state.activePresetId !== undefined) {
          activePresetIdRef.current = state.activePresetId
        }
        console.log('[DEBUG] Refs initialized successfully')
      } catch (error) {
        console.error('[DEBUG] Error initializing refs:', error)
        return
      }

      const handleMessage = (event: {
        data: {
          pluginMessage:
            | PluginToAppMessage
            | { type: 'init'; payload: { figmaUserId: string | null } }
        }
      }) => {
        try {
          switch (event.data?.pluginMessage?.type) {
            case 'init': {
              const { figmaUserId } = event.data.pluginMessage.payload
              if (figmaUserId) {
                // Always update currentUserId if we receive it from plugin
                // This ensures we have it even if URL doesn't have it
                dispatch({
                  type: 'setStateByPath',
                  payload: {
                    path: 'currentUserId',
                    value: figmaUserId,
                  },
                })
                console.log(
                  'Received figmaUserId from plugin init:',
                  figmaUserId,
                )
              }
              break
            }
            case 'setSelectedNodePluginData': {
              const data = event.data.pluginMessage.payload
              console.log(
                'Received selected node plugin data:',
                data.length,
                'nodes',
              )

              // Check if any selected nodes have a preset ID
              const nodeData = data as (Partial<PropertySettingsRow> & {
                presetId?: string
              })[]
              const presetIds = nodeData
                .map((node) => (node as any).presetId)
                .filter((id): id is string => !!id)

              console.log('Preset ID extraction:', {
                nodeDataLength: nodeData.length,
                nodeDataSample: nodeData.slice(0, 2).map((node) => ({
                  hasPresetId: 'presetId' in node,
                  presetId: (node as any).presetId,
                })),
                presetIds,
                presetIdsLength: presetIds.length,
                currentUserId: state.currentUserId,
              })

              if (presetIds.length > 0 && currentUserIdRef.current) {
                // Use the first preset ID found (if multiple nodes have different IDs, use the first one)
                const presetIdToLoad = presetIds[0]

                // Check if auto-load is enabled
                if (isAutoLoadFromSelectedNodesRef.current) {
                  // No-op: if this preset is already active, skip loading
                  if (activePresetIdRef.current === presetIdToLoad) {
                    console.log(
                      'Preset already active, skipping reload:',
                      presetIdToLoad,
                    )
                  } else {
                    console.log(
                      'Found preset ID on selected nodes, auto-loading preset:',
                      presetIdToLoad,
                    )

                    // Clear found preset ID since we're auto-loading (no button needed)
                    dispatch({
                      type: 'setFoundPresetId',
                      payload: {
                        presetId: null,
                      },
                    })

                    // Set loading state
                    dispatch({
                      type: 'setPresetLoading',
                      payload: { isLoading: true },
                    })

                    // Set this preset as active
                    dispatch({
                      type: 'setActivePresetId',
                      payload: {
                        presetId: presetIdToLoad,
                      },
                    })

                    // Load the preset and merge into local preset for editing
                    // Wrap in catch to prevent unhandled promise rejections
                    // Defensive check - ensure we have valid state
                    if (!state.currentUserId || !state.propertySettings) {
                      console.error(
                        'Invalid state when trying to load preset:',
                        {
                          currentUserId: state.currentUserId,
                          hasPropertySettings: !!state.propertySettings,
                        },
                      )
                      return
                    }
                    // Use ref to get latest propertySettings without including it in dependencies
                    const currentPropertySettings = propertySettingsRef.current
                    if (
                      !currentPropertySettings ||
                      typeof currentPropertySettings !== 'object'
                    ) {
                      console.error(
                        'Invalid propertySettings when trying to load preset',
                      )
                      return
                    }
                    loadPresetFromId(
                      presetIdToLoad,
                      currentUserIdRef.current!,
                      dispatch,
                      currentPropertySettings,
                    ).catch((error) => {
                      console.error('Error in loadPresetFromId:', error)
                    })
                  }
                } else {
                  // Auto-load disabled - track the preset ID for manual loading button
                  // But only if this preset isn't already active (user may have already loaded it)
                  if (activePresetIdRef.current !== presetIdToLoad) {
                    dispatch({
                      type: 'setFoundPresetId',
                      payload: {
                        presetId: presetIdToLoad,
                      },
                    })
                    console.log(
                      'Found preset ID on selected nodes (auto-load disabled):',
                      presetIdToLoad,
                    )
                  } else {
                    // Preset is already active, clear found preset ID to hide button
                    dispatch({
                      type: 'setFoundPresetId',
                      payload: {
                        presetId: null,
                      },
                    })
                    console.log(
                      'Preset already active, hiding load button:',
                      presetIdToLoad,
                    )
                  }
                }
              } else {
                // No preset IDs found - clear found preset ID
                dispatch({
                  type: 'setFoundPresetId',
                  payload: {
                    presetId: null,
                  },
                })
                // No preset IDs found - switch back to local preset
                if (activePresetIdRef.current !== null) {
                  console.log(
                    'No preset IDs found on nodes, switching back to local preset',
                  )

                  // Set loading state
                  dispatch({
                    type: 'setPresetLoading',
                    payload: { isLoading: true },
                  })

                  // Clear active preset
                  dispatch({
                    type: 'setActivePresetId',
                    payload: {
                      presetId: null,
                    },
                  })

                  // Reload local preset
                  if (currentUserIdRef.current) {
                    getLocalPresetId(currentUserIdRef.current)
                      .then((localPresetId) => {
                        if (localPresetId) {
                          loadPreset(localPresetId)
                            .then((localPresetPropertySettings) => {
                              dispatch({
                                type: 'loadPreset',
                                payload: {
                                  presetPropertySettings:
                                    localPresetPropertySettings,
                                },
                              })
                              // Clear loading state
                              dispatch({
                                type: 'setPresetLoading',
                                payload: { isLoading: false },
                              })
                            })
                            .catch((error) => {
                              console.error(
                                'Error loading local preset:',
                                error,
                              )
                              dispatch({
                                type: 'setPresetLoading',
                                payload: { isLoading: false },
                              })
                            })
                        } else {
                          dispatch({
                            type: 'setPresetLoading',
                            payload: { isLoading: false },
                          })
                        }
                      })
                      .catch((error) => {
                        console.error('Error getting local preset ID:', error)
                        dispatch({
                          type: 'setPresetLoading',
                          payload: { isLoading: false },
                        })
                      })
                  } else {
                    dispatch({
                      type: 'setPresetLoading',
                      payload: { isLoading: false },
                    })
                  }
                }
              }
              dispatch({
                type: 'setSelectedNodePluginData',
                payload: {
                  partialPropertySettings: nodeData.map(
                    ({ presetId, ...rest }) => rest,
                  ),
                },
              })
              break
            }
          }
        } catch (error) {
          console.error('Error handling plugin message:', error)
        }
      }

      try {
        console.log('[DEBUG] Setting window.onmessage handler')
        window.onmessage = handleMessage
        console.log('[DEBUG] window.onmessage handler set successfully')

        // Only request current selection on initial setup, not on every re-run
        // This prevents excessive message sending when dependencies change
        if (
          currentUserIdRef.current &&
          !hasRequestedInitialSelectionRef.current
        ) {
          try {
            console.log('[DEBUG] Requesting initial selection')
            dispatchPluginAction({ type: 'getCurrentSelection' })
            hasRequestedInitialSelectionRef.current = true
            console.log('[DEBUG] Initial selection requested')
          } catch (error) {
            // Ignore errors from dispatchPluginAction (e.g., in test environment)
            console.warn(
              '[DEBUG] Failed to dispatch getCurrentSelection:',
              error,
            )
          }
        }
        console.log('[DEBUG] Message handler setup completed successfully')
      } catch (error) {
        console.error('[DEBUG] Error in message handler setup:', error)
        console.error('Error setting up message handler:', error)
      }

      // Cleanup
      // Note: In StrictMode, this cleanup runs before the effect runs again
      // We always clear window.onmessage here, and the effect will set it again
      return () => {
        try {
          console.log('[DEBUG] Cleaning up message handler')
          // Always clear - the effect will set it again if needed
          // This is safe because the effect runs after cleanup in StrictMode
          window.onmessage = null as any
          console.log('[DEBUG] Message handler cleaned up')
        } catch (error) {
          console.error('[DEBUG] Error cleaning up message handler:', error)
        }
      }
    },
    [
      // Note: We intentionally don't include dispatch or state values in dependencies
      // because:
      // 1. dispatch from useReducer is stable and doesn't need to be in deps
      // 2. We use refs to always get the latest state values without causing
      //    the message handler to be recreated
      // 3. The refs are updated in a separate useEffect whenever state changes
      // IMPORTANT: This effect should only run once on mount, not on every state change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
  )

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

  // Persist user options when they change (but not on initial load)
  useEffect(() => {
    // Use currentUserId from state (which was set from URL on mount)
    const userIdToUse = state.currentUserId

    console.log('Persistence useEffect triggered:', {
      currentUserId: state.currentUserId,
      userIdToUse,
      isLoading,
      hasLoadedInitialOptions: hasLoadedInitialOptionsRef.current,
      isGroupedByStatus: state.isGroupedByStatus,
      isGroupedByType: state.isGroupedByType,
    })

    if (!userIdToUse || isLoading || !hasLoadedInitialOptionsRef.current) {
      console.log('Skipping persistence:', {
        reason: !userIdToUse
          ? 'no userId'
          : isLoading
            ? 'isLoading'
            : 'ref not set',
      })
      return
    }

    // Debounce updates to avoid excessive database calls
    const timeoutId = setTimeout(async () => {
      try {
        // Defensive check - ensure we still have a valid userId
        if (!userIdToUse) {
          console.log('[DEBUG] Skipping persistence - no userId')
          return
        }

        const updateValues = {
          is_auto_scroll_enabled: state.isAutoScrollEnabled,
          is_grouped_by_status: state.isGroupedByStatus,
          is_grouped_by_type: state.isGroupedByType,
          is_auto_load_from_selected_nodes: state.isAutoLoadFromSelectedNodes,
        }

        console.log(
          '[DEBUG] Persisting user options to database...',
          updateValues,
        )

        // Track this update so we can ignore it in realtime handler
        pendingUserOptionsUpdateRef.current = {
          timestamp: Date.now(),
          values: updateValues,
        }

        try {
          console.log('💾 Calling updateUserOptions with:', {
            userIdToUse,
            updateValues,
            sessionId,
          })
          const result = await updateUserOptions(userIdToUse, updateValues)
          console.log('📦 updateUserOptions returned:', result)

          if (result) {
            console.log('✅ User options persisted successfully:', {
              isAutoScrollEnabled: result.is_auto_scroll_enabled,
              isGroupedByStatus: result.is_grouped_by_status,
              isGroupedByType: result.is_grouped_by_type,
              sessionId,
              date_modified: result.date_modified,
            })

            // Dispatch test signals for each updated option
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isAutoScrollEnabled',
              value: result.is_auto_scroll_enabled,
            })
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isGroupedByStatus',
              value: result.is_grouped_by_status,
            })
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isGroupedByType',
              value: result.is_grouped_by_type,
            })
            dispatchTestSignal({
              type: 'user-option-updated',
              optionName: 'isAutoLoadFromSelectedNodes',
              value: result.is_auto_load_from_selected_nodes,
            })

            // Realtime subscription will update the UI automatically
            // Clear pending update after successful save (with a small delay to allow realtime to process)
            setTimeout(() => {
              pendingUserOptionsUpdateRef.current = null
            }, 3000)
          } else {
            console.warn(
              '⚠️ User options update returned null (table may not exist)',
            )
            pendingUserOptionsUpdateRef.current = null
          }
        } catch (error) {
          console.error('[DEBUG] Error in persistence timeout callback:', error)
          console.error('❌ Error persisting user options:', error)
          pendingUserOptionsUpdateRef.current = null
          // Don't throw - allow app to continue with defaults
        }
      } catch (error) {
        console.error('❌ Outer error persisting user options:', error)
        pendingUserOptionsUpdateRef.current = null
      }
    }, 500) // 500ms debounce

    return () => {
      try {
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('[DEBUG] Error clearing timeout:', error)
      }
    }
  }, [
    state.currentUserId,
    state.isAutoScrollEnabled,
    state.isGroupedByStatus,
    state.isGroupedByType,
    state.isAutoLoadFromSelectedNodes,
    isLoading,
    dispatch,
  ])

  // Sync body dark class with isLightMode state
  useEffect(() => {
    if (!isLoading) {
      document
        .querySelector('body')
        ?.classList.toggle('dark', !state.isLightMode)
    }
  }, [state.isLightMode, isLoading])

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
          <NetworkActivitySpinner />
        </AppContext>
      </NetworkActivityProvider>
    </StrictMode>
  )
}
