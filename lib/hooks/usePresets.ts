import { useAppContext } from '@/app/state/AppWrapper'
import { loadPreset } from '@/lib/services/propertySettingsService'
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

  const isAdmin = currentUserId === '321070720595916577'

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

      const newEnabledProperties: Record<string, string[]> = {}

      await Promise.all(
        allPresetsToLoad.map(async (preset) => {
          if (cancelled) return

          try {
            const propertySettings = await loadPreset(preset.id)
            const enabled = propertySettings.map((ps) => ps.label)
            newEnabledProperties[preset.id] = enabled
          } catch (error) {
            console.error(`Error loading preset ${preset.id}:`, error)
            newEnabledProperties[preset.id] = []
          }
        }),
      )

      if (!cancelled) {
        setPresetEnabledProperties(newEnabledProperties)
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
