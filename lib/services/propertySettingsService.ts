import { supabaseClient } from '@/supabase/client'
import { Database } from '@/supabase/generated-types'

export type PropertySettingsWithDetails = Database['public']['Tables']['property_settings']['Row'] & {
  text_property_settings?: Database['public']['Tables']['text_property_settings']['Row'] | null
  dimension_property_settings?: Database['public']['Tables']['dimension_property_settings']['Row'] | null
  numeric_property_settings?: Database['public']['Tables']['numeric_property_settings']['Row'] | null
}

export async function getPropertySettingsByLabel(label: string): Promise<PropertySettingsWithDetails | null> {
  const { data, error } = await supabaseClient
    .from('property_settings')
    .select(`
      *,
      text_property_settings (*),
      dimension_property_settings (*),
      numeric_property_settings (*)
    `)
    .eq('label', label)
    .single()

  if (error) {
    console.error('Error fetching property settings:', error)
    return null
  }

  return data
}

export async function getAllPropertySettings(): Promise<PropertySettingsWithDetails[]> {
  try {
    console.log('Fetching all property settings...')

    const { data, error } = await supabaseClient
      .from('property_settings')
      .select(`
        *,
        text_property_settings (*),
        dimension_property_settings (*),
        numeric_property_settings (*)
      `)
      .order('label')

    if (error) {
      console.error('Error fetching all property settings:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    console.log(`Successfully fetched ${data?.length || 0} property settings`)
    return data || []
  } catch (err) {
    console.error('Unexpected error in getAllPropertySettings:', err)
    return []
  }
}

export async function updatePropertySettingEnabled(
  propertySettingId: number,
  isEnabled: boolean
): Promise<void> {
  const { error } = await supabaseClient
    .from('property_settings')
    .update({
      is_enabled: isEnabled,
      date_modified: new Date().toISOString()
    })
    .eq('id', propertySettingId)

  if (error) {
    console.error('Error updating property setting enabled state:', error)
    throw error
  }
}

export async function updatePropertySettingMode(
  propertySettingId: number,
  randomizationMode: Database['public']['Enums']['randomization_mode']
): Promise<void> {
  const { error } = await supabaseClient
    .from('property_settings')
    .update({
      randomization_mode: randomizationMode,
      date_modified: new Date().toISOString()
    })
    .eq('id', propertySettingId)

  if (error) {
    console.error('Error updating property setting mode:', error)
    throw error
  }
}

export async function updatePropertySettingSortOrder(
  propertySettingId: number,
  sortOrder: Database['public']['Enums']['post_randomization_sort_order']
): Promise<void> {
  const { error } = await supabaseClient
    .from('property_settings')
    .update({
      post_randomization_sort_order: sortOrder,
      date_modified: new Date().toISOString()
    })
    .eq('id', propertySettingId)

  if (error) {
    console.error('Error updating property setting sort order:', error)
    throw error
  }
}

export async function updateTextPropertySettings(
  propertySettingId: number,
  updates: Partial<Database['public']['Tables']['text_property_settings']['Update']>
): Promise<void> {
  const { error } = await supabaseClient
    .from('text_property_settings')
    .update({
      ...updates,
      date_modified: new Date().toISOString()
    })
    .eq('property_setting_id', propertySettingId)

  if (error) {
    console.error('Error updating text property settings:', error)
    throw error
  }
}

export async function updateDimensionPropertySettings(
  propertySettingId: number,
  updates: Partial<Database['public']['Tables']['dimension_property_settings']['Update']>
): Promise<void> {
  const { error } = await supabaseClient
    .from('dimension_property_settings')
    .update({
      ...updates,
      date_modified: new Date().toISOString()
    })
    .eq('property_setting_id', propertySettingId)

  if (error) {
    console.error('Error updating dimension property settings:', error)
    throw error
  }
}

export async function updateNumericPropertySettings(
  propertySettingId: number,
  updates: Partial<Database['public']['Tables']['numeric_property_settings']['Update']>
): Promise<void> {
  const { error } = await supabaseClient
    .from('numeric_property_settings')
    .update({
      ...updates,
      date_modified: new Date().toISOString()
    })
    .eq('property_setting_id', propertySettingId)

  if (error) {
    console.error('Error updating numeric property settings:', error)
    throw error
  }
}

export async function getUserPresets(figmaUserId: string): Promise<Database['public']['Tables']['presets']['Row'][]> {
  const { data, error } = await supabaseClient
    .from('presets')
    .select('*')
    .eq('figma_user_id', figmaUserId)
    .order('date_modified', { ascending: false })

  if (error) {
    console.error('Error fetching user presets:', error)
    return []
  }

  return data || []
}

export async function createPreset(
  figmaUserId: string,
  label: string,
  propertySettings: PropertySettingsWithDetails[]
): Promise<Database['public']['Tables']['presets']['Row']> {
  // First create the preset
  const { data: preset, error: presetError } = await supabaseClient
    .from('presets')
    .insert({
      figma_user_id: figmaUserId,
      label,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    })
    .select()
    .single()

  if (presetError) {
    console.error('Error creating preset:', presetError)
    throw presetError
  }

  // Then create copies of the property settings linked to this preset
  const propertySettingsToInsert = propertySettings.map(ps => ({
    label: ps.label,
    randomization_mode: ps.randomization_mode,
    post_randomization_sort_order: ps.post_randomization_sort_order,
    is_enabled: ps.is_enabled,
    collection_id: preset.id,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  }))

  const { data: newPropertySettings, error: propertySettingsError } = await supabaseClient
    .from('property_settings')
    .insert(propertySettingsToInsert)
    .select()

  if (propertySettingsError) {
    console.error('Error creating property settings for preset:', propertySettingsError)
    throw propertySettingsError
  }

  // Create the related settings (text, dimension, numeric)
  for (let i = 0; i < propertySettings.length; i++) {
    const originalPs = propertySettings[i]
    const newPs = newPropertySettings[i]

    if (originalPs.text_property_settings) {
      await supabaseClient
        .from('text_property_settings')
        .insert({
          property_setting_id: newPs.id,
          decimal_places: originalPs.text_property_settings.decimal_places,
          thousands_separator: originalPs.text_property_settings.thousands_separator,
          prefix: originalPs.text_property_settings.prefix,
          suffix: originalPs.text_property_settings.suffix,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
        })
    }

    if (originalPs.dimension_property_settings) {
      await supabaseClient
        .from('dimension_property_settings')
        .insert({
          property_setting_id: newPs.id,
          dimension: originalPs.dimension_property_settings.dimension,
          anchor_position: originalPs.dimension_property_settings.anchor_position,
          preserve_aspect_ratio: originalPs.dimension_property_settings.preserve_aspect_ratio,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
        })
    }

    if (originalPs.numeric_property_settings) {
      await supabaseClient
        .from('numeric_property_settings')
        .insert({
          property_setting_id: newPs.id,
          min: originalPs.numeric_property_settings.min,
          max: originalPs.numeric_property_settings.max,
          operator: originalPs.numeric_property_settings.operator,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
        })
    }
  }

  return preset
}

export async function loadPreset(presetId: number): Promise<PropertySettingsWithDetails[]> {
  const { data, error } = await supabaseClient
    .from('property_settings')
    .select(`
      *,
      text_property_settings (*),
      dimension_property_settings (*),
      numeric_property_settings (*)
    `)
    .eq('collection_id', presetId)
    .order('label')

  if (error) {
    console.error('Error loading preset:', error)
    throw error
  }

  return data || []
}

export async function deletePreset(presetId: number): Promise<void> {
  const { error } = await supabaseClient
    .from('presets')
    .delete()
    .eq('id', presetId)

  if (error) {
    console.error('Error deleting preset:', error)
    throw error
  }
}
