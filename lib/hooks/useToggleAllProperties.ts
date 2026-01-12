import { bulkDisableProperties } from '@/lib/services/propertySettingsService'
import { getEnabledProperties } from '@/lib/utils/propertySettingsUtils'
import { useCallback, useMemo } from 'react'

type UseToggleAllPropertiesParams = {
  dispatch: any
  propertySettings: Record<string, any>
  currentUserId: string | null
}

export function useToggleAllProperties({
  dispatch,
  propertySettings,
  currentUserId,
}: UseToggleAllPropertiesParams) {
  const enabledProperties = useMemo(
    () => getEnabledProperties(propertySettings),
    [propertySettings],
  )

  const hasAnyEnabled = enabledProperties.length > 0

  const handleClickDisableAll = useCallback(async () => {
    if (!dispatch || !currentUserId) return

    // Only disable if there are enabled properties
    if (!hasAnyEnabled) return

    const confirmed = confirm(
      'Are you sure you want to disable all property randomization? This will turn off all enabled properties.',
    )
    if (!confirmed) {
      return
    }

    const propertyIdsToDisable = enabledProperties.map((ps) => ps.id)

    // Optimistically update properties immediately
    enabledProperties.forEach((ps) => {
      dispatch({
        type: 'setStateByPath',
        payload: {
          path: `propertySettings.${ps.label}.is_enabled`,
          value: false,
        },
      })
    })

    try {
      // Bulk disable all properties in a single query
      await bulkDisableProperties(propertyIdsToDisable)
    } catch (error) {
      console.error('Error disabling all properties:', error)
      // Revert optimistic updates on error
      enabledProperties.forEach((ps) => {
        dispatch({
          type: 'setStateByPath',
          payload: {
            path: `propertySettings.${ps.label}.is_enabled`,
            value: true, // Revert to enabled state
          },
        })
      })
    }
  }, [dispatch, currentUserId, hasAnyEnabled, enabledProperties])

  return {
    handleClickDisableAll,
    hasAnyEnabled,
  }
}
