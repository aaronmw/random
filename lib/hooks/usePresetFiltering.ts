import { loadPreset } from '@/lib/services/propertySettingsService'
import { useEffect, useMemo, useState } from 'react'

type UsePresetFilteringParams = {
  presets: Array<{
    id: string
    label: string | null
    figma_user_id: string
    visibility?: 'public' | 'private'
  }>
  currentUserId: string | null
}

export function usePresetFiltering({
  presets,
  currentUserId,
}: UsePresetFilteringParams) {
  // Separate presets into user's own and others' public presets
  const userPresets = useMemo(
    () =>
      presets.filter((preset) => {
        // Always filter out local preset - it's managed automatically
        if (preset.label === '__local__') {
          return false
        }
        return preset.figma_user_id === currentUserId
      }),
    [presets, currentUserId],
  )

  const publicPresets = useMemo(
    () =>
      presets.filter((preset) => {
        if (preset.label === '__local__' || preset.label === '__default__') {
          return false
        }
        return preset.figma_user_id !== currentUserId
      }),
    [presets, currentUserId],
  )

  const [presetEnabledProperties, setPresetEnabledProperties] = useState<
    Record<string, string[]>
  >({})

  // Fetch enabled properties for each preset (cached and only loads when presets change)
  useEffect(() => {
    let cancelled = false

    const fetchEnabledProperties = async () => {
      const allPresets = [...userPresets, ...publicPresets]

      // Skip if no presets
      if (allPresets.length === 0) {
        setPresetEnabledProperties({})
        return
      }

      const newEnabledProperties: Record<string, string[]> = {}

      // Load all presets in parallel (now optimized since they only contain enabled properties)
      await Promise.all(
        allPresets.map(async (preset) => {
          if (cancelled) return

          try {
            // Since presets now only save enabled properties, all returned properties are enabled
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
  }, [userPresets, publicPresets])

  return {
    userPresets,
    publicPresets,
    presetEnabledProperties,
  }
}
