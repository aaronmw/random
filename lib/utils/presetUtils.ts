import { AppState } from '@/app/types'
import { AppAction } from '@/app/state/AppReducer'
import { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import { loadPreset } from '@/lib/services/propertySettingsService'

/**
 * Load a preset by ID and merge it into the local preset.
 * Maps loaded preset settings to use local preset IDs to avoid database write/read cycles.
 */
export async function loadPresetFromId(
  presetId: string,
  currentUserId: string,
  dispatch: React.Dispatch<AppAction>,
  propertySettings: AppState['propertySettings'],
): Promise<void> {
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
    const mappedPropertySettings: PropertySettingsWithDetails[] =
      presetPropertySettings.map((loadedPs) => {
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

/**
 * Format a preset label for display.
 * Handles special labels like '__local__' and '__default__'.
 */
export function getPresetDisplayLabel(label: string | null): string {
  if (!label) return 'Unnamed Preset'
  if (label === '__local__') return 'Local Preset'
  if (label === '__default__') return 'Default Preset'
  return label
}

/**
 * Format a property name for display.
 * Converts kebab-case or snake_case to Title Case.
 */
export function formatPropertyName(propertyName: string): string {
  return propertyName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
