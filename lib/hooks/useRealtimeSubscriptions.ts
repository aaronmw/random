import { AppState } from '@/app/types'
import { AppAction } from '@/app/state/AppReducer'
import { USER_OPTIONS_CHANGE_DETECTION_WINDOW } from '@/lib/constants'
import { getLocalPresetId } from '@/lib/services/propertySettingsService'
import { supabaseClient } from '@/supabase/client'
import { useEffect, useRef } from 'react'

// Cache for property setting lookups to avoid repeated queries
const propertySettingCache = new Map<
  string,
  { label: string; preset_id: string | null } | null
>()

async function getPropertySettingCached(
  propertySettingId: string,
): Promise<{ label: string; preset_id: string | null } | null> {
  if (propertySettingCache.has(propertySettingId)) {
    return propertySettingCache.get(propertySettingId)!
  }

  const { data: propertySetting } = await supabaseClient
    .from('property_settings')
    .select('label, preset_id')
    .eq('id', propertySettingId)
    .single()

  const result = propertySetting || null
  propertySettingCache.set(propertySettingId, result)
  return result
}

interface UseRealtimeSubscriptionsParams {
  currentUserId: string | null
  dispatch: React.Dispatch<AppAction>
  propertySettings: AppState['propertySettings']
  sessionId: string
  pendingUserOptionsUpdateRef: React.MutableRefObject<{
    timestamp: number
    values: {
      is_auto_scroll_enabled: boolean
      is_grouped_by_status: boolean
      is_grouped_by_type: boolean
      is_auto_load_from_selected_nodes: boolean
    }
  } | null>
}

export function useRealtimeSubscriptions({
  currentUserId,
  dispatch,
  propertySettings,
  sessionId,
  pendingUserOptionsUpdateRef,
}: UseRealtimeSubscriptionsParams) {
  // Track the local preset ID to re-establish subscription when it changes
  const localPresetIdRef = useRef<string | null>(null)
  const subscriptionChannelRef = useRef<ReturnType<
    typeof supabaseClient.channel
  > | null>(null)

  // Set up real-time subscription for local preset property settings
  useEffect(() => {
    if (!currentUserId) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return () => {}
    }

    const setupLocalPresetSubscription = async () => {
      try {
        const localPresetId = await getLocalPresetId(currentUserId)
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
          `local-preset-${currentUserId}-${localPresetId}`,
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
                  event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
              const propertySetting = await getPropertySettingCached(
                propertySettingId,
              )

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
                    event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
              const propertySettingId =
                (payload.new as any)?.property_setting_id ||
                (payload.old as any)?.property_setting_id
              const propertySetting = await getPropertySettingCached(
                propertySettingId,
              )

              // Use ref value to check against current preset ID
              if (
                propertySetting &&
                propertySetting.preset_id === localPresetIdRef.current
              ) {
                dispatch({
                  type: 'handleDatabaseChange',
                  payload: {
                    table: 'text_property_settings',
                    event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
              const propertySettingId =
                (payload.new as any)?.property_setting_id ||
                (payload.old as any)?.property_setting_id
              const propertySetting = await getPropertySettingCached(
                propertySettingId,
              )

              // Use ref value to check against current preset ID
              if (
                propertySetting &&
                propertySetting.preset_id === localPresetIdRef.current
              ) {
                dispatch({
                  type: 'handleDatabaseChange',
                  payload: {
                    table: 'dimension_property_settings',
                    event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
  }, [currentUserId, dispatch, propertySettings])

  // Set up real-time subscription for presets
  // Subscribe to: user's own presets + all public presets
  useEffect(() => {
    if (!currentUserId) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return () => {}
    }

    const channel = supabaseClient.channel(`presets-${currentUserId}`)

    // Subscribe to user's own presets
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'presets',
        filter: `figma_user_id=eq.${currentUserId}`,
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
            event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
            ? (payload.old as any)?.figma_user_id === currentUserId
            : (payload.new as any)?.figma_user_id === currentUserId

        if (!isUserOwnPreset) {
          console.log(
            'Public preset changed via realtime (accumulating):',
            payload,
          )
          dispatch({
            type: 'addPendingPublicPresetChange',
            payload: {
              table: 'presets',
              event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
  }, [currentUserId, dispatch])

  // Set up real-time subscription for user options
  useEffect(() => {
    if (!currentUserId) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return () => {}
    }

    const channel = supabaseClient.channel(
      `user-options-${currentUserId}`,
    )

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_options',
          filter: `figma_user_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log('User options changed via realtime:', payload)

          // Check if this is our own update by comparing with pending update
          if (pendingUserOptionsUpdateRef.current) {
            const { timestamp, values } = pendingUserOptionsUpdateRef.current
            const payloadTimestamp = payload.commit_timestamp
              ? new Date(payload.commit_timestamp).getTime()
              : Date.now()

            // If update is very recent (within detection window) and values match, it's likely ours
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

            if (timeDiff < USER_OPTIONS_CHANGE_DETECTION_WINDOW && valuesMatch) {
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

            // If it's been more than the detection window, clear the pending update
            if (timeDiff >= USER_OPTIONS_CHANGE_DETECTION_WINDOW) {
              pendingUserOptionsUpdateRef.current = null
            }
          }

          dispatch({
            type: 'handleDatabaseChange',
            payload: {
              table: 'user_options',
              event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
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
  }, [currentUserId, dispatch, sessionId, pendingUserOptionsUpdateRef])
}
