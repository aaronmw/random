import { triggerPresetPropertiesRefresh } from '@/lib/hooks/usePresets'
import {
    createPreset,
    deletePreset,
    getLocalPresetId,
    getUserPresets,
    loadPreset,
    updatePreset,
    updatePresetMerge,
    updatePresetVisibility
} from '@/lib/services/propertySettingsService'
import {
    getOrCreateUserOptions,
    updateUserOptions,
} from '@/lib/services/userOptionsService'
import { MouseEvent, useCallback } from 'react'

type UsePresetHandlersParams = {
  dispatch: any
  propertySettings: Record<string, any>
  presets: Array<{
    id: string
    label: string | null
    figma_user_id: string
    visibility?: 'public' | 'private' | 'hidden'
  }>
  currentUserId: string | null
  isAutoScrollEnabled: boolean
  isGroupedByStatus: boolean
  isGroupedByType: boolean
  isLightMode: boolean
  onOpenModal: () => void
  onSetPresetBeingEdited: (name: string | null) => void
}

export function usePresetHandlers({
  dispatch,
  propertySettings,
  presets,
  currentUserId,
  isAutoScrollEnabled,
  isGroupedByStatus,
  isGroupedByType,
  isLightMode,
  onOpenModal,
  onSetPresetBeingEdited,
}: UsePresetHandlersParams) {
  const saveCurrentSettingsAsPreset = useCallback(
    async ({
      presetName,
      presetId,
      newPresetName,
    }:
      | {
          presetName?: never
          presetId?: never
          newPresetName: string
        }
      | {
          presetName: string
          presetId: string
          newPresetName?: never
        }) => {
      if (!propertySettings || !currentUserId || !dispatch) return

      try {
        // Only save enabled properties to reduce data size and improve performance
        const propertySettingsArray = Object.values(propertySettings).filter(
          (ps) => ps.is_enabled === true,
        )
        const presetLabel = newPresetName || presetName || 'Untitled'

        if (presetId) {
          // Update existing preset
          await updatePreset(presetId, currentUserId, propertySettingsArray)
        } else {
          // Create new preset
          await createPreset(currentUserId, presetLabel, propertySettingsArray)

          // Fallback: Refresh presets after a short delay if realtime doesn't update
          setTimeout(async () => {
            if (currentUserId && dispatch) {
              const updatedPresets = await getUserPresets(currentUserId)
              dispatch({
                type: 'setPresets',
                payload: {
                  presets: updatedPresets.map((p) => ({
                    id: p.id,
                    label: p.label,
                    figma_user_id: p.figma_user_id,
                    visibility: (p as any).visibility || 'private',
                  })),
                },
              })
            }
          }, 500) // 500ms delay to give realtime a chance to update first
        }

        onSetPresetBeingEdited(null)
      } catch (error) {
        console.error('Error saving preset:', error)
      }
    },
    [propertySettings, currentUserId, dispatch, onSetPresetBeingEdited],
  )

  const handleClickCreateNew = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      onSetPresetBeingEdited(null)
      onOpenModal()
    },
    [onOpenModal, onSetPresetBeingEdited],
  )

  const handleClickLoadPreset = useCallback(
    async (presetId: string) => {
      if (!currentUserId || !dispatch) return

      // Find preset name for confirmation message
      const preset = presets.find((p) => p.id === presetId)
      const presetName = preset?.label || 'this preset'
      const isDefaultPreset = preset?.label === '__default__'

      // Ask for confirmation before loading
      const confirmMessage = isDefaultPreset
        ? 'Are you sure you want to factory reset? This will restore all settings to their default values and overwrite your current settings. This action cannot be undone.'
        : `Are you sure you want to load "${presetName}"? This will overwrite your current settings. ` +
          `If you want to preserve your current settings, save them as a new preset first.`

      if (!confirm(confirmMessage)) {
        return
      }

      // Set loading state
      dispatch({
        type: 'setPresetLoading',
        payload: { isLoading: true },
      })

      try {
        // Load preset from database (only contains enabled properties)
        const presetPropertySettings = await loadPreset(presetId)

        // Get local preset ID
        const localPresetId = await getLocalPresetId(currentUserId)
        if (!localPresetId) {
          console.error('Local preset ID not found')
          return
        }

        // Update local preset to match loaded preset (merge operation)
        await updatePresetMerge(localPresetId, currentUserId, presetPropertySettings)

        // Reload property settings from local preset to get correct IDs
        const localPresetPropertySettings = await loadPreset(localPresetId)

        // Dispatch action to load preset with correct IDs from local preset
        dispatch({
          type: 'loadPreset',
          payload: {
            presetPropertySettings: localPresetPropertySettings,
          },
        })
      } catch (error) {
        console.error('Error loading preset:', error)
      } finally {
        // Clear loading state
        dispatch({
          type: 'setPresetLoading',
          payload: { isLoading: false },
        })
      }
    },
    [currentUserId, dispatch, presets],
  )

  const handleClickOverwritePreset = useCallback(
    async (
      presetId: string,
      presetName: string,
      event: MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation()

      const preset = presets.find((p) => p.id === presetId)
      const isDefaultPreset = preset?.label === '__default__'

      const confirmMessage = isDefaultPreset
        ? 'Are you sure you want to update the default settings? This will change the defaults for all new users of the app. Existing users will not be affected.'
        : `Are you sure you want to overwrite "${presetName}" with your current settings?`

      if (!confirm(confirmMessage)) {
        return
      }

      if (!propertySettings || !currentUserId || !dispatch) return

      try {
        let propertySettingsArray: any[]

        if (isDefaultPreset) {
          // For default preset overwrite: include ALL properties and force disable them
          // This ensures all property settings and their options are synced regardless of enabled status
          propertySettingsArray = Object.values(propertySettings).map((ps) => ({
            ...ps,
            is_enabled: false,
          }))
        } else {
          // Only save enabled properties to reduce data size and improve performance
          propertySettingsArray = Object.values(propertySettings).filter(
            (ps) => ps.is_enabled === true,
          )
        }

        // Overwrite preset - this updates property_settings, not presets table
        // Preset list doesn't need to refresh for this operation
        await updatePreset(presetId, currentUserId, propertySettingsArray)

        // If overwriting default preset, also save current user settings as defaults
        if (isDefaultPreset) {
          // Get or create default user options (for figma_user_id = 'default')
          const defaultUserOptions = await getOrCreateUserOptions('default')

          // Update default user options with current user's settings
          await updateUserOptions('default', {
            is_auto_scroll_enabled: isAutoScrollEnabled,
            is_grouped_by_status: isGroupedByStatus,
            is_grouped_by_type: isGroupedByType,
            is_light_mode: isLightMode,
          })
        }

        // Trigger refresh of preset enabled properties to update the label
        triggerPresetPropertiesRefresh()

        // Close the main preset menu by pressing Escape key
        // Use a small delay to ensure the update completes first
        setTimeout(() => {
          const escapeEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true,
          })
          document.dispatchEvent(escapeEvent)
        }, 100)
      } catch (error) {
        console.error('Error overwriting preset:', error)
      }
    },
    [
      propertySettings,
      currentUserId,
      dispatch,
      presets,
      isAutoScrollEnabled,
      isGroupedByStatus,
      isGroupedByType,
      isLightMode,
    ],
  )

  const handleClickToggleVisibility = useCallback(
    async (
      presetId: string,
      newVisibility: 'private' | 'public' | 'hidden',
      event: MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation()

      if (!currentUserId || !dispatch) return

      try {
        // Update preset visibility
        await updatePresetVisibility(presetId, currentUserId, newVisibility)

        // Fallback: Refresh presets after a short delay if realtime doesn't update
        setTimeout(async () => {
          if (currentUserId && dispatch) {
            const updatedPresets = await getUserPresets(currentUserId)
            dispatch({
              type: 'setPresets',
              payload: {
                presets: updatedPresets.map((p) => ({
                  id: p.id,
                  label: p.label,
                  figma_user_id: p.figma_user_id,
                  visibility: (p as any).visibility || 'private',
                })),
              },
            })
          }
        }, 500) // 500ms delay to give realtime a chance to update first
      } catch (error) {
        console.error('Error updating preset visibility:', error)
      }
    },
    [currentUserId, dispatch],
  )

  const handleClickRenamePreset = useCallback(
    (presetName: string, event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      const preset = presets.find((p) => p.label === presetName)
      if (!preset) return

      onSetPresetBeingEdited(presetName)
      onOpenModal()
    },
    [presets, onSetPresetBeingEdited, onOpenModal],
  )

  const handleClickDeletePreset = useCallback(
    async (presetName: string, event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()

      if (!confirm('Are you sure you want to delete this preset?')) {
        return
      }

      try {
        const preset = presets.find((p) => p.label === presetName)
        if (preset) {
          await deletePreset(preset.id)

          // Fallback: Refresh presets after a short delay if realtime doesn't update
          // Note: DELETE events should work via realtime, but this ensures UI updates
          setTimeout(async () => {
            if (currentUserId && dispatch) {
              const updatedPresets = await getUserPresets(currentUserId)
              dispatch({
                type: 'setPresets',
                payload: {
                  presets: updatedPresets.map((p) => ({
                    id: p.id,
                    label: p.label,
                    figma_user_id: p.figma_user_id,
                    visibility: (p as any).visibility || 'private',
                  })),
                },
              })
            }
          }, 500) // 500ms delay to give realtime a chance to update first
        }
      } catch (error) {
        console.error('Error deleting preset:', error)
      }
    },
    [presets, currentUserId, dispatch],
  )

  return {
    saveCurrentSettingsAsPreset,
    handleClickCreateNew,
    handleClickLoadPreset,
    handleClickOverwritePreset,
    handleClickToggleVisibility,
    handleClickRenamePreset,
    handleClickDeletePreset,
  }
}
