import { AppState } from '@/app/types'
import { AppAction } from '@/app/state/AppReducer'
import {
  bulkPopulatePreset,
  getAllPropertySettings,
  getOrCreateLocalPreset,
  getUserPresets,
  loadPreset,
} from '@/lib/services/propertySettingsService'
import {
  getOrCreateUserOptions,
  updateUserOptions,
} from '@/lib/services/userOptionsService'
import { getAdminUserId } from '@/lib/utils/getAdminUserId'
import { supabaseClient } from '@/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UseInitialDataLoaderParams {
  currentUserId: AppState['currentUserId']
  dispatch: React.Dispatch<AppAction>
}

export function useInitialDataLoader({
  currentUserId,
  dispatch,
}: UseInitialDataLoaderParams) {
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

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
        let userIdToUse = currentUserId || figmaUserIdFromUrl || null

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
          currentUserId,
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
            currentUserId: currentUserId || null,
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  return { isLoading }
}
