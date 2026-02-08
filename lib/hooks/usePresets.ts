import { useAppContext } from '@/app/state/AppWrapper'
import { loadPresetsBatch } from '@/lib/services/propertySettingsService'
import { getAdminUserId } from '@/lib/utils/getAdminUserId'
import { useEffect, useMemo, useState } from 'react'

let refreshTrigger = 0
const refreshListeners = new Set<() => void>()

export function triggerPresetPropertiesRefresh() {
  refreshTrigger++
  refreshListeners.forEach((listener) => listener())
}

export function usePresets() {
  const { presets, currentUserId } = useAppContext()
  const [refreshKey, setRefreshKey] = useState(0)

  const isAdmin = currentUserId === getAdminUserId()

  const userPresets = useMemo(
    () =>
      presets.filter((preset) => {
        if (preset.label === '__local__') {
          return false
        }
        // Exclude hidden presets from menu
        if (preset.visibility === 'hidden') {
          return false
        }
        // Admin users can see the __default__ preset
        if (preset.label === '__default__') {
          return isAdmin
        }
        return preset.figma_user_id === currentUserId
      }),
    [presets, currentUserId, isAdmin],
  )

  const publicPresets = useMemo(
    () =>
      presets.filter((preset) => {
        if (preset.label === '__local__' || preset.label === '__default__') {
          return false
        }
        // Exclude hidden presets from menu
        if (preset.visibility === 'hidden') {
          return false
        }
        return preset.figma_user_id !== currentUserId
      }),
    [presets, currentUserId],
  )

  const allPresets = useMemo(() => presets, [presets])

  const [presetEnabledProperties, setPresetEnabledProperties] = useState<
    Record<string, string[]>
  >({})

  useEffect(() => {
    const refreshListener = () => {
      setRefreshKey((prev) => prev + 1)
    }
    refreshListeners.add(refreshListener)
    return () => {
      refreshListeners.delete(refreshListener)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchEnabledProperties = async () => {
      const allPresetsToLoad = [...userPresets, ...publicPresets]

      if (allPresetsToLoad.length === 0) {
        setPresetEnabledProperties({})
        return
      }

      const presetIds = allPresetsToLoad.map((preset) => preset.id)
      const newEnabledProperties: Record<string, string[]> = {}

      try {
        // Batch load all presets in a single query instead of N queries
        const presetsData = await loadPresetsBatch(presetIds)

        for (const presetId of presetIds) {
          if (cancelled) return

          const propertySettings = presetsData[presetId] || []
          const enabled = propertySettings
            .filter((ps) => ps.is_enabled)
            .map((ps) => ps.label)
          newEnabledProperties[presetId] = enabled
        }

        if (!cancelled) {
          setPresetEnabledProperties(newEnabledProperties)
        }
      } catch (error) {
        console.error('Error loading presets batch:', error)
        // Fallback: set empty arrays for all presets on error
        for (const presetId of presetIds) {
          newEnabledProperties[presetId] = []
        }
        if (!cancelled) {
          setPresetEnabledProperties(newEnabledProperties)
        }
      }
    }

    fetchEnabledProperties()

    return () => {
      cancelled = true
    }
  }, [userPresets, publicPresets, refreshKey])

  return {
    userPresets,
    publicPresets,
    allPresets,
    presetEnabledProperties,
  }
}
