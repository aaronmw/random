export type PropertySetting = {
  label: string
  is_enabled?: boolean
  [key: string]: any
}

export type PropertySettings = Record<string, PropertySetting>

/**
 * Get all enabled property settings from a property settings object
 */
export function getEnabledProperties(
  propertySettings: PropertySettings,
): PropertySetting[] {
  return Object.values(propertySettings).filter((ps) => ps.is_enabled === true)
}

/**
 * Get property labels that should be disabled when loading a preset.
 * Returns labels of properties that are currently enabled but not in the loaded preset.
 */
export function getPropertiesToDisable(
  propertySettings: PropertySettings,
  loadedPropertyLabels: Set<string>,
): PropertySetting[] {
  return Object.values(propertySettings).filter(
    (ps) => ps.is_enabled === true && !loadedPropertyLabels.has(ps.label),
  )
}
