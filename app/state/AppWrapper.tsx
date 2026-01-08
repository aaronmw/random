'use client'

import { AppReducer, initialState } from '@/app/state/AppReducer'
import { AppState, PluginToAppMessage, PropertySettingsRow } from '@/app/types'
import { CrashScreen } from '@/components/CrashSreen'
import { ResizeHandle } from '@/components/ResizeHandle'
import { dispatchPluginAction } from '@/lib/dispatchPluginAction'
import {
  getAllPropertySettings,
  getUserPresets,
  getOrCreateLocalPreset,
  loadPreset,
  getLocalPresetId,
  updatePreset,
} from '@/lib/services/propertySettingsService'
import {
  getOrCreateUserOptions,
  getUserOptions,
  updateUserOptions,
} from '@/lib/services/userOptionsService'
import { useSessionId } from '@/lib/hooks/useSessionId'
import { NetworkActivityProvider } from '@/lib/hooks/useNetworkActivity'
import { NetworkActivitySpinner } from '@/components/NetworkActivitySpinner'
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
      is_light_mode: boolean
    }
  } | null>(null)

  // Read figmaUserId from URL once and store in state
  const hasReadUrlRef = useRef(false)
  useEffect(() => {
    if (hasReadUrlRef.current) return // Only read once
    hasReadUrlRef.current = true

    const figmaUserIdFromUrl = searchParams.get('figmaUserId')
    if (figmaUserIdFromUrl && figmaUserIdFromUrl !== state.currentUserId) {
      console.log('Reading figmaUserId from URL and storing in state:', figmaUserIdFromUrl)
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

        // Use currentUserId from state (which was set from URL on mount)
        const userIdToUse = state.currentUserId

        console.log('User ID:', {
          currentUserId: state.currentUserId,
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
            console.log('Local preset is empty, populating from default preset...')

            // Get default preset
            const { data: defaultPreset, error: defaultError } = await supabaseClient
              .from('presets')
              .select('*')
              .eq('figma_user_id', 'default')
              .eq('label', '__default__')
              .maybeSingle()

            if (defaultError || !defaultPreset) {
              console.error('Default preset not found. Please ensure seed.sql has been executed.', defaultError)
              // Continue with empty property settings - user will need to factory reset
            } else {
              // Load default preset's property settings
              const defaultSettings = await loadPreset(defaultPreset.id)

              if (defaultSettings.length > 0) {
                // Populate local preset with default settings
                await updatePreset(localPresetId, userIdToUse, defaultSettings)

                // Reload the local preset's property settings
                propertySettings = await loadPreset(localPresetId)
                console.log('Local preset populated with', propertySettings.length, 'property settings from default preset')
              }
            }
          }

          // Verify all property settings belong to the local preset
          const wrongPresetSettings = propertySettings.filter(ps => ps.preset_id !== localPresetId)
          if (wrongPresetSettings.length > 0) {
            console.error('CRITICAL: Found property settings with wrong preset_id:', {
              localPresetId,
              wrongPresetSettings: wrongPresetSettings.map(ps => ({ label: ps.label, id: ps.id, preset_id: ps.preset_id })),
            })
            // Filter out wrong preset settings to prevent errors
            const correctPropertySettings = propertySettings.filter(ps => ps.preset_id === localPresetId)
            console.log('Filtered property settings:', {
              originalCount: propertySettings.length,
              correctCount: correctPropertySettings.length,
              removedCount: wrongPresetSettings.length,
            })

            console.log('Loading user presets for user:', userIdToUse)
            const userPresets = await getUserPresets(userIdToUse)
            console.log('User presets loaded:', userPresets.length)

            // Load user options (may be null if table doesn't exist yet)
            const userOptions = await getOrCreateUserOptions(userIdToUse)
            console.log('User options loaded from database:', userOptions)

            dispatch({
              type: 'setInitialData',
              payload: {
                propertySettings: correctPropertySettings,
                presets: userPresets,
                currentUserId: userIdToUse,
                userOptions: userOptions
                  ? {
                      isAutoScrollEnabled: userOptions.is_auto_scroll_enabled,
                      isGroupedByStatus: userOptions.is_grouped_by_status,
                      isGroupedByType: userOptions.is_grouped_by_type,
                      isLightMode: userOptions.is_light_mode,
                    }
                  : undefined,
              },
            })
            console.log('setInitialData dispatched with userOptions:', userOptions ? {
              isAutoScrollEnabled: userOptions.is_auto_scroll_enabled,
              isGroupedByStatus: userOptions.is_grouped_by_status,
              isGroupedByType: userOptions.is_grouped_by_type,
              isLightMode: userOptions.is_light_mode,
            } : 'undefined')
            return
          }

          // Log opacity setting for debugging
          const opacitySetting = propertySettings.find(ps => ps.label === 'opacity')
          console.log('Initial load - property settings:', {
            localPresetId,
            propertySettingsCount: propertySettings.length,
            opacityId: opacitySetting?.id,
            opacityPresetId: opacitySetting?.preset_id,
            opacityEnabled: opacitySetting?.is_enabled,
            allPresetIds: propertySettings.map(ps => ({ label: ps.label, id: ps.id, preset_id: ps.preset_id })).slice(0, 5),
          })

          console.log('Loading user presets for user:', userIdToUse)
          const userPresets = await getUserPresets(userIdToUse)
          console.log('User presets loaded:', userPresets.length)

          // Load user options (may be null if table doesn't exist yet)
          const userOptions = await getOrCreateUserOptions(userIdToUse)
          console.log('📥 User options loaded from database:', {
            exists: !!userOptions,
            values: userOptions ? {
              is_auto_scroll_enabled: userOptions.is_auto_scroll_enabled,
              is_grouped_by_status: userOptions.is_grouped_by_status,
              is_grouped_by_type: userOptions.is_grouped_by_type,
              is_light_mode: userOptions.is_light_mode,
            } : null,
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
                  }
                : undefined,
            },
          })
          console.log('📤 setInitialData dispatched with userOptions:', userOptions ? {
            isAutoScrollEnabled: userOptions.is_auto_scroll_enabled,
            isGroupedByStatus: userOptions.is_grouped_by_status,
            isGroupedByType: userOptions.is_grouped_by_type,
            isLightMode: userOptions.is_light_mode,
          } : 'undefined')
        } else {
          // No user ID - load global templates (for admin/default preset management)
          console.log('No Figma user ID, loading global templates')
          const allPropertySettings = await getAllPropertySettings(null)
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
            currentUserId: userIdToUse || null,
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [state.currentUserId])

  // Track the local preset ID to re-establish subscription when it changes
  const localPresetIdRef = useRef<string | null>(null)
  const subscriptionChannelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null)

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
          console.log('Local preset ID unchanged, keeping existing subscription')
          return
        }

        // Clean up old subscription if preset ID changed
        if (localPresetIdRef.current !== null && subscriptionChannelRef.current) {
          console.log('Preset ID changed, cleaning up old subscription')
          supabaseClient.removeChannel(subscriptionChannelRef.current)
          subscriptionChannelRef.current = null
        }

        localPresetIdRef.current = localPresetId
        const currentPresetId = localPresetId // Capture for use in handlers

        const channel = supabaseClient.channel(`local-preset-${state.currentUserId}-${localPresetId}`)
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
              const eventPresetId = payload.new?.preset_id || payload.old?.preset_id
              if (eventPresetId !== currentPresetId) {
                console.warn('Ignoring property_settings event for wrong preset:', {
                  eventPresetId,
                  expectedPresetId: currentPresetId,
                  event: payload.eventType,
                  label: payload.new?.label || payload.old?.label,
                })
                return
              }

              console.log('Local preset property setting changed:', {
                event: payload.eventType,
                newPresetId: payload.new?.preset_id,
                oldPresetId: payload.old?.preset_id,
                newId: payload.new?.id,
                oldId: payload.old?.id,
                label: payload.new?.label || payload.old?.label,
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
              const propertySettingId = payload.new?.property_setting_id || payload.old?.property_setting_id
              const { data: propertySetting } = await supabaseClient
                .from('property_settings')
                .select('label, preset_id')
                .eq('id', propertySettingId)
                .single()

              // Use ref value to check against current preset ID
              if (propertySetting && propertySetting.preset_id === localPresetIdRef.current) {
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
                .eq('id', payload.new?.property_setting_id || payload.old?.property_setting_id)
                .single()

              // Use ref value to check against current preset ID
              if (propertySetting && propertySetting.preset_id === localPresetIdRef.current) {
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
                .eq('id', payload.new?.property_setting_id || payload.old?.property_setting_id)
                .single()

              // Use ref value to check against current preset ID
              if (propertySetting && propertySetting.preset_id === localPresetIdRef.current) {
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
          .subscribe((status, error) => {
            if (status === 'SUBSCRIBED') {
              console.log('Local preset subscription active')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Local preset subscription error:', error)
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
        console.log('User preset changed via realtime:', payload)
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
        // Only process if it's not the user's own preset (already handled above)
        if (payload.new?.figma_user_id !== state.currentUserId) {
          console.log('Public preset changed via realtime:', payload)
          dispatch({
            type: 'handleDatabaseChange',
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

    channel.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        console.log('Presets subscription active')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Presets subscription error:', error)
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

    const channel = supabaseClient.channel(`user-options-${state.currentUserId}`)

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
              payload.new?.is_auto_scroll_enabled === values.is_auto_scroll_enabled &&
              payload.new?.is_grouped_by_status === values.is_grouped_by_status &&
              payload.new?.is_grouped_by_type === values.is_grouped_by_type &&
              payload.new?.is_light_mode === values.is_light_mode

            if (timeDiff < 2000 && valuesMatch) {
              console.log('Ignoring own user options update (change source tracking)', {
                timeDiff,
                valuesMatch,
                sessionId,
              })
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
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.log('User options subscription active')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('User options subscription error:', error)
        }
      })

    return () => {
      console.log('Cleaning up user options subscription')
      supabaseClient.removeChannel(channel)
    }
  }, [state.currentUserId, dispatch, sessionId])

  useEffect(() => {
    const handleMessage = (event: {
      data: {
        pluginMessage:
          | PluginToAppMessage
          | { type: 'init'; payload: { figmaUserId: string | null } }
      }
    }) => {
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
            console.log('Received figmaUserId from plugin init:', figmaUserId)
          }
          break
        }
        case 'setSelectedNodePluginData': {
          const data = event.data.pluginMessage.payload
          console.log('Received selected node plugin data:', data.length, 'nodes')
          dispatch({
            type: 'setSelectedNodePluginData',
            payload: {
              partialPropertySettings: data as Partial<PropertySettingsRow>[],
            },
          })
          break
        }
      }
    }

    window.onmessage = handleMessage

    // Request current selection when message handler is set up
    // This ensures we get the selection even if init message already arrived
    dispatchPluginAction({ type: 'getCurrentSelection' })

    // Cleanup
    return () => {
      window.onmessage = null as any
    }
  }, [dispatch])

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
    if (!isLoading && state.currentUserId && !hasLoadedInitialOptionsRef.current) {
      const timeoutId = setTimeout(() => {
        console.log('Marking initial options as loaded, enabling persistence')
        hasLoadedInitialOptionsRef.current = true
      }, 100) // Small delay to ensure state has updated
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, state.currentUserId])

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
        reason: !userIdToUse ? 'no userId' : isLoading ? 'isLoading' : 'ref not set',
      })
      return
    }

    // Debounce updates to avoid excessive database calls
    const timeoutId = setTimeout(async () => {
      const updateValues = {
        is_auto_scroll_enabled: state.isAutoScrollEnabled,
        is_grouped_by_status: state.isGroupedByStatus,
        is_grouped_by_type: state.isGroupedByType,
        is_light_mode: state.isLightMode,
      }

      console.log('Persisting user options to database...', updateValues)

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
            isLightMode: result.is_light_mode,
            sessionId,
            date_modified: result.date_modified,
          })

          // Verify the values were actually saved correctly
          const verifyResult = await getOrCreateUserOptions(userIdToUse)
          console.log('🔍 Verification - re-fetched user options:', {
            is_grouped_by_status: verifyResult?.is_grouped_by_status,
            matches: verifyResult?.is_grouped_by_status === updateValues.is_grouped_by_status,
          })

          // Clear pending update after successful save (with a small delay to allow realtime to process)
          setTimeout(() => {
            pendingUserOptionsUpdateRef.current = null
          }, 3000)
        } else {
          console.warn('⚠️ User options update returned null (table may not exist)')
          pendingUserOptionsUpdateRef.current = null
        }
      } catch (error) {
        console.error('❌ Error persisting user options:', error)
        pendingUserOptionsUpdateRef.current = null
        // Don't throw - allow app to continue with defaults
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [
    state.currentUserId,
    state.isAutoScrollEnabled,
    state.isGroupedByStatus,
    state.isGroupedByType,
    state.isLightMode,
    isLoading,
    dispatch,
  ])

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
