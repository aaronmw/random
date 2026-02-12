import { useAppContext } from '@/app/state/AppWrapper'
import {
  deletePreset,
  getLocalPresetId,
} from '@/lib/services/propertySettingsService'
import {
  getUserOptions,
  updateUserOptions,
} from '@/lib/services/userOptionsService'
import { getAdminUserId } from '@/lib/utils/getAdminUserId'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useFactoryReset() {
  const { dispatch, currentUserId } = useAppContext()
  const searchParams = useSearchParams()
  const figmaUserIdFromUrl = searchParams.get('figmaUserId')

  const handleClickFactoryReset = useCallback(async () => {
    // Try multiple sources for the user ID
    // 1. From context (should be set from plugin init message or URL)
    // 2. From URL query params
    // 3. From useSearchParams hook
    // 4. Admin user ID in dev mode
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('figmaUserId')
    let userId = currentUserId || userIdFromUrl || figmaUserIdFromUrl

    // In dev mode, fall back to admin user ID if no user ID is found
    if (!userId && process.env.NODE_ENV === 'development') {
      const adminUserId = getAdminUserId()
      if (adminUserId) {
        userId = adminUserId
        console.log('Using admin user ID for factory reset in dev mode:', adminUserId)
      }
    }

    if (!userId) {
      alert(
        'Cannot factory reset: no user ID found. Please ensure you are logged in and the plugin is running.',
      )
      return
    }

    if (
      !confirm(
        'Are you sure you want to factory reset? This will delete your local preset, reset user options (group by type, enabled on top, auto scroll), and restore all settings to their default values. This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      // Set loading state
      if (dispatch) {
        dispatch({
          type: 'setFactoryResetting',
          payload: { isResetting: true },
        })
      }

      // Get local preset ID
      const localPresetId = await getLocalPresetId(userId)

      if (localPresetId) {
        // Delete the local preset (this will cascade delete all property_settings)
        await deletePreset(localPresetId)
      }

      // Get default user options to use as reset values
      const defaultUserOptions = await getUserOptions('default')

      // Reset user options to defaults
      // Use default user options if available, otherwise use hardcoded defaults
      const resetValues = defaultUserOptions
        ? {
            is_auto_scroll_enabled: defaultUserOptions.is_auto_scroll_enabled,
            is_grouped_by_status: defaultUserOptions.is_grouped_by_status,
            is_grouped_by_type: defaultUserOptions.is_grouped_by_type,
            is_light_mode: defaultUserOptions.is_light_mode,
          }
        : {
            is_auto_scroll_enabled: false,
            is_grouped_by_status: false,
            is_grouped_by_type: false,
            is_light_mode: false,
          }

      await updateUserOptions(userId, resetValues)

      // Reload the page to trigger the normal first-time initialization path
      // This will create a new local preset and populate it from the default preset
      window.location.reload()
    } catch (error) {
      console.error('Error during factory reset:', error)
      alert('Failed to factory reset. Please try again.')

      // Clear loading state on error
      if (dispatch) {
        dispatch({
          type: 'setFactoryResetting',
          payload: { isResetting: false },
        })
      }
    }
  }, [dispatch, currentUserId, figmaUserIdFromUrl])

  return { handleClickFactoryReset }
}
