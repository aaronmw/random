import { useAppContext } from '@/app/state/AppWrapper'
import { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import { loadPreset } from '@/lib/services/propertySettingsService'

export function useLoadPresetFromNodes() {
  const { dispatch, currentUserId, foundPresetId, propertySettings } = useAppContext()

  const loadPresetFromFoundId = async () => {
    if (!foundPresetId || !currentUserId || !dispatch) {
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
        presetId: foundPresetId,
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
      const presetPropertySettings = await loadPreset(foundPresetId)

      // Map loaded preset settings to use local preset IDs (from current state)
      // This avoids a database write/read cycle
      const mappedPropertySettings: PropertySettingsWithDetails[] = presetPropertySettings.map((loadedPs) => {
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
      if (dispatch) {
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
      }
    } catch (error) {
      console.error('Error loading preset:', error)
      if (dispatch) {
        dispatch({
          type: 'setPresetLoading',
          payload: { isLoading: false },
        })
      }
    }
  }

  return {
    foundPresetId,
    loadPresetFromFoundId,
  }
}
