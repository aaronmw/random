import { supabaseClient } from '@/supabase/client'
import { Database } from '@/supabase/generated-types'
import { startNetworkActivity, endNetworkActivity } from '@/lib/utils/networkActivity'

export type PropertySettingsWithDetails = Database['public']['Tables']['property_settings']['Row'] & {
  text_property_settings?: Database['public']['Tables']['text_property_settings']['Row'] | null
  dimension_property_settings?: Database['public']['Tables']['dimension_property_settings']['Row'] | null
  numeric_property_settings?: Database['public']['Tables']['numeric_property_settings']['Row'] | null
  list_property_settings?: Database['public']['Tables']['list_property_settings']['Row'] | null
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
  propertySettingId: string,
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
  propertySettingId: string,
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
  propertySettingId: string,
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
  propertySettingId: string,
  updates: Partial<Database['public']['Tables']['text_property_settings']['Update']>
): Promise<void> {
  // Note: text_property_settings table does NOT have date_created or date_modified columns
  const { error } = await supabaseClient
    .from('text_property_settings')
    .update(updates)
    .eq('property_setting_id', propertySettingId)

  if (error) {
    console.error('Error updating text property settings:', error)
    throw error
  }

  // Update the parent property_settings.date_modified
  const { error: parentUpdateError } = await supabaseClient
    .from('property_settings')
    .update({
      date_modified: new Date().toISOString(),
    })
    .eq('id', propertySettingId)

  if (parentUpdateError) {
    console.error('Error updating parent property_settings date_modified:', parentUpdateError)
    // Don't throw - the detail update succeeded, this is just metadata
  }
}

export async function updateDimensionPropertySettings(
  propertySettingId: string,
  updates: Partial<Database['public']['Tables']['dimension_property_settings']['Update']>
): Promise<void> {
  // Note: dimension_property_settings table does NOT have date_created or date_modified columns
  const upsertData = {
    property_setting_id: propertySettingId,
    ...updates,
  }

  const { error } = await supabaseClient
    .from('dimension_property_settings')
    .upsert(upsertData, {
      onConflict: 'property_setting_id',
    })

  if (error) {
    console.error('Error upserting dimension property settings:', error)
    throw error
  }

  // Update the parent property_settings.date_modified
  const { error: parentUpdateError } = await supabaseClient
    .from('property_settings')
    .update({
      date_modified: new Date().toISOString(),
    })
    .eq('id', propertySettingId)

  if (parentUpdateError) {
    console.error('Error updating parent property_settings date_modified:', parentUpdateError)
    // Don't throw - the detail update succeeded, this is just metadata
  }
}

export async function updateNumericPropertySettings(
  propertySettingId: string,
  updates: Partial<Database['public']['Tables']['numeric_property_settings']['Update']>
): Promise<void> {
  startNetworkActivity()
  try {
    // Validate propertySettingId is a valid UUID
    if (!propertySettingId || typeof propertySettingId !== 'string') {
      throw new Error(`Invalid propertySettingId: ${propertySettingId}`)
    }

    // Verify the property_setting exists (required for foreign key constraint)
    const { data: propertySetting, error: psError } = await supabaseClient
      .from('property_settings')
      .select('id, label')
      .eq('id', propertySettingId)
      .maybeSingle()

    if (psError) {
      console.error('Error verifying property_setting exists:', psError)
      throw new Error(`Failed to verify property_setting: ${psError.message}`)
    }

    if (!propertySetting) {
      throw new Error(`Property setting with id ${propertySettingId} does not exist`)
    }

    // Clean and validate updates - only include defined, valid values
    const cleanUpdates: any = {}
    if (updates.min !== undefined && updates.min !== null) {
      const minValue = Number(updates.min)
      if (!isNaN(minValue)) {
        cleanUpdates.min = minValue
      }
    }
    if (updates.max !== undefined && updates.max !== null) {
      const maxValue = Number(updates.max)
      if (!isNaN(maxValue)) {
        cleanUpdates.max = maxValue
      }
    }
    if (updates.operator !== undefined && updates.operator !== null && (updates.operator === 'add' || updates.operator === 'multiply')) {
      cleanUpdates.operator = updates.operator
    }

    // For upsert to work properly with partial updates, we need to:
    // 1. Get existing row if it exists (to preserve other fields)
    // 2. Merge updates with existing values
    // 3. Upsert the merged data

    const { data: existing, error: fetchError } = await supabaseClient
      .from('numeric_property_settings')
      .select('*')
      .eq('property_setting_id', propertySettingId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching existing numeric property settings:', fetchError)
      throw fetchError
    }

    // Merge existing values with updates
    // Note: numeric_property_settings table does NOT have date_created or date_modified columns
    const upsertData: any = {
      property_setting_id: propertySettingId,
      min: cleanUpdates.min !== undefined ? cleanUpdates.min : (existing?.min ?? 0),
      max: cleanUpdates.max !== undefined ? cleanUpdates.max : (existing?.max ?? 100),
      operator: cleanUpdates.operator !== undefined ? cleanUpdates.operator : (existing?.operator ?? 'add'),
    }

    console.log('Upserting numeric property settings:', {
      propertySettingId,
      propertySettingLabel: propertySetting.label,
      updates,
      cleanUpdates,
      existing,
      upsertData,
    })

    // Use upsert - Supabase will update if row exists, insert if it doesn't
    // Only include fields that are actually set (don't include undefined)
    const finalUpsertData: any = {
      property_setting_id: propertySettingId,
    }

    if (upsertData.min !== undefined && upsertData.min !== null) {
      finalUpsertData.min = upsertData.min
    }
    if (upsertData.max !== undefined && upsertData.max !== null) {
      finalUpsertData.max = upsertData.max
    }
    if (upsertData.operator !== undefined && upsertData.operator !== null) {
      finalUpsertData.operator = upsertData.operator
    }

    const { error, data } = await supabaseClient
      .from('numeric_property_settings')
      .upsert(finalUpsertData, {
        onConflict: 'property_setting_id',
      })
      .select()

    if (error) {
      // Try to get more error details
      const errorDetails: any = {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }

      // Try to access all error properties
      try {
        if (error instanceof Error) {
          errorDetails.name = error.name
          errorDetails.stack = error.stack
        }
        // Try to get all enumerable properties
        for (const key in error) {
          if (error.hasOwnProperty(key)) {
            errorDetails[key] = (error as any)[key]
          }
        }
        // Try to get non-enumerable properties
        Object.getOwnPropertyNames(error).forEach(key => {
          if (!errorDetails[key]) {
            try {
              errorDetails[key] = (error as any)[key]
            } catch (e) {
              // Ignore
            }
          }
        })
      } catch (e) {
        console.warn('Could not extract all error properties:', e)
      }

      console.error('Error upserting numeric property settings:', {
        error: errorDetails,
        errorString: String(error),
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        propertySettingId,
        propertySettingLabel: propertySetting.label,
        updates,
        cleanUpdates,
        existing,
        finalUpsertData,
      })

      // Try to stringify the error
      try {
        console.error('Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      } catch (e) {
        console.error('Could not stringify error:', e)
      }

      // Create a more descriptive error
      const descriptiveError = new Error(
        `Failed to upsert numeric property settings: ${error.message || 'Unknown error'} ` +
        `(code: ${error.code || 'unknown'}, details: ${error.details || 'none'})`
      )
      ;(descriptiveError as any).originalError = error
      throw descriptiveError
    }

    if (!data || data.length === 0) {
      console.warn('No rows returned from upsert for numeric property settings:', {
        propertySettingId,
        updates,
        finalUpsertData,
      })
    } else {
      console.log('Successfully upserted numeric property settings:', data[0])
    }

    // Update the parent property_settings.date_modified
    const { error: parentUpdateError } = await supabaseClient
      .from('property_settings')
      .update({
        date_modified: new Date().toISOString(),
      })
      .eq('id', propertySettingId)

    if (parentUpdateError) {
      console.error('Error updating parent property_settings date_modified:', parentUpdateError)
      // Don't throw - the detail update succeeded, this is just metadata
    }
  } finally {
    endNetworkActivity()
  }
}

export async function updateListPropertySettings(
  propertySettingId: string,
  updates: Partial<Database['public']['Tables']['list_property_settings']['Update']>
): Promise<void> {
  // Note: list_property_settings table does NOT have date_created or date_modified columns
  const upsertData = {
    property_setting_id: propertySettingId,
    ...updates,
  }

  const { error } = await supabaseClient
    .from('list_property_settings')
    .upsert(upsertData, {
      onConflict: 'property_setting_id',
    })

  if (error) {
    console.error('Error upserting list property settings:', error)
    throw error
  }

  // Update the parent property_settings.date_modified
  const { error: parentUpdateError } = await supabaseClient
    .from('property_settings')
    .update({
      date_modified: new Date().toISOString(),
    })
    .eq('id', propertySettingId)

  if (parentUpdateError) {
    console.error('Error updating parent property_settings date_modified:', parentUpdateError)
    // Don't throw - the detail update succeeded, this is just metadata
  }
}

export async function getUserPresets(
  figmaUserId: string,
): Promise<Database['public']['Tables']['presets']['Row'][]> {
  startNetworkActivity()
  try {
    // Admin user can see local preset, others cannot
    const isAdmin = figmaUserId === '321070720595916577'

    // Get user's own presets (excluding local preset unless admin)
    let userPresetsQuery = supabaseClient
      .from('presets')
      .select('*')
      .eq('figma_user_id', figmaUserId)

    if (!isAdmin) {
      userPresetsQuery = userPresetsQuery.neq('label', '__local__') // Exclude local preset from normal preset lists
    }

    const { data: userPresets, error: userPresetsError } = await userPresetsQuery.order('date_modified', { ascending: false })

    if (userPresetsError) {
      console.error('Error fetching user presets:', userPresetsError)
      return []
    }

    // Get all public presets from other users
    const { data: publicPresets, error: publicPresetsError } = await supabaseClient
      .from('presets')
      .select('*')
      .eq('visibility', 'public')
      .neq('figma_user_id', figmaUserId) // Exclude user's own presets (already fetched above)
      .neq('label', '__local__') // Exclude local presets
      .neq('label', '__default__') // Exclude default preset
      .order('date_modified', { ascending: false })

    if (publicPresetsError) {
      console.error('Error fetching public presets:', publicPresetsError)
      // Continue with just user's presets if public fetch fails
    }

    // Combine: user's presets first, then public presets from others
    // User's presets are already sorted by date_modified DESC
    const allPresets = [
      ...(userPresets || []),
      ...(publicPresets || []),
    ]

    return allPresets
  } finally {
    endNetworkActivity()
  }
}

export async function createPreset(
  figmaUserId: string,
  label: string,
  propertySettings: PropertySettingsWithDetails[],
  visibility: 'private' | 'public' = 'private',
): Promise<Database['public']['Tables']['presets']['Row']> {
  startNetworkActivity()
  try {
    // First create the preset
    const { data: preset, error: presetError } = await supabaseClient
      .from('presets')
      .insert({
        figma_user_id: figmaUserId,
        label,
        visibility,
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
      preset_id: preset.id,
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

    // Check if this property has numeric settings (either nested or top-level)
    // The state may have min/max at top level (merged from numeric_property_settings)
    const numericMin = originalPs.numeric_property_settings?.min ?? (originalPs as any).min
    const numericMax = originalPs.numeric_property_settings?.max ?? (originalPs as any).max
    const numericOperator = originalPs.numeric_property_settings?.operator ?? (originalPs as any).operator

    if (numericMin !== undefined || numericMax !== undefined || numericOperator !== undefined) {
      // Note: numeric_property_settings table does NOT have date_created or date_modified columns
      await supabaseClient
        .from('numeric_property_settings')
        .insert({
          property_setting_id: newPs.id,
          min: numericMin ?? 0,
          max: numericMax ?? 100,
          operator: numericOperator ?? 'add',
        })
    }

    if (originalPs.list_property_settings) {
      // Note: list_property_settings table does NOT have date_created or date_modified columns
      const optionsArray = originalPs.list_property_settings.options
      const optionsString = Array.isArray(optionsArray)
        ? optionsArray.join('\n')
        : String(optionsArray || '')
      await supabaseClient
        .from('list_property_settings')
        .insert({
          property_setting_id: newPs.id,
          options: optionsString,
        })
    }
  }

    return preset
  } finally {
    endNetworkActivity()
  }
}

export async function loadPreset(presetId: string): Promise<PropertySettingsWithDetails[]> {
  startNetworkActivity()
  try {
    const { data, error } = await supabaseClient
      .from('property_settings')
      .select(`
        *,
        text_property_settings (*),
        dimension_property_settings (*),
        numeric_property_settings (*),
        list_property_settings (*)
      `)
      .eq('preset_id', presetId)
      .order('label')

    if (error) {
      console.error('Error loading preset:', error)
      throw error
    }

    return data || []
  } finally {
    endNetworkActivity()
  }
}

export async function deletePreset(presetId: string): Promise<void> {
  startNetworkActivity()
  try {
    const { error } = await supabaseClient
      .from('presets')
      .delete()
      .eq('id', presetId)

    if (error) {
      console.error('Error deleting preset:', error)
      throw error
    }
  } finally {
    endNetworkActivity()
  }
}

export async function getLocalPresetId(figmaUserId: string): Promise<string | null> {
  startNetworkActivity()
  try {
    const { data, error } = await supabaseClient
      .from('presets')
      .select('id')
      .eq('figma_user_id', figmaUserId)
      .eq('label', '__local__')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error fetching local preset ID:', error)
      return null
    }

    return data?.id || null
  } finally {
    endNetworkActivity()
  }
}

export async function getOrCreateLocalPreset(figmaUserId: string): Promise<Database['public']['Tables']['presets']['Row']> {
  startNetworkActivity()
  try {
    // Try to get existing local preset
    const { data: existingPreset, error: fetchError } = await supabaseClient
      .from('presets')
      .select('*')
      .eq('figma_user_id', figmaUserId)
      .eq('label', '__local__')
      .single()

    if (existingPreset && !fetchError) {
      return existingPreset
    }

    // Create new local preset if it doesn't exist
    const { data: newPreset, error: createError } = await supabaseClient
      .from('presets')
      .insert({
        figma_user_id: figmaUserId,
        label: '__local__',
        visibility: 'private',
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError || !newPreset) {
      console.error('Error creating local preset:', createError)
      throw createError || new Error('Failed to create local preset')
    }

    return newPreset
  } finally {
    endNetworkActivity()
  }
}

export async function updatePreset(
  presetId: string,
  figmaUserId: string,
  propertySettings: PropertySettingsWithDetails[],
): Promise<Database['public']['Tables']['presets']['Row']> {
  startNetworkActivity()
  try {
    // Verify preset belongs to user
    const { data: preset, error: presetError } = await supabaseClient
      .from('presets')
      .select('*')
      .eq('id', presetId)
      .eq('figma_user_id', figmaUserId)
      .single()

    if (presetError || !preset) {
      console.error('Error fetching preset for update:', presetError)
      throw new Error('Preset not found or access denied')
    }

    // Prevent modification of default preset
    if (preset.label === '__default__') {
      throw new Error('Cannot update default preset property settings')
    }

    // Update preset metadata (date_modified)
    const { data: updatedPreset, error: updatePresetError } = await supabaseClient
      .from('presets')
      .update({
        date_modified: new Date().toISOString(),
      })
      .eq('id', presetId)
      .select()
      .single()

    if (updatePresetError || !updatedPreset) {
      console.error('Error updating preset metadata:', updatePresetError)
      throw new Error('Failed to update preset')
    }

    // Delete existing property_settings (cascade will handle detail tables)
    const { error: deleteError } = await supabaseClient
      .from('property_settings')
      .delete()
      .eq('preset_id', presetId)

    if (deleteError) {
      console.error('Error deleting existing property settings:', deleteError)
      throw deleteError
    }

    // Insert new property settings
    const propertySettingsToInsert = propertySettings.map((ps) => ({
      label: ps.label,
      randomization_mode: ps.randomization_mode,
      post_randomization_sort_order: ps.post_randomization_sort_order,
      is_enabled: ps.is_enabled,
      preset_id: presetId,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    }))

    const { data: newPropertySettings, error: propertySettingsError } =
      await supabaseClient
        .from('property_settings')
        .insert(propertySettingsToInsert)
        .select()

    if (propertySettingsError) {
      console.error(
        'Error creating property settings for preset:',
        propertySettingsError,
      )
      throw propertySettingsError
    }

    // Create detail settings in parallel
    const detailInserts: Promise<any>[] = []

    for (let i = 0; i < propertySettings.length; i++) {
      const originalPs = propertySettings[i]
      const newPs = newPropertySettings[i]

      if (originalPs.text_property_settings) {
        detailInserts.push(
          supabaseClient.from('text_property_settings').insert({
            property_setting_id: newPs.id,
            decimal_places: originalPs.text_property_settings.decimal_places,
            thousands_separator: originalPs.text_property_settings.thousands_separator,
            prefix: originalPs.text_property_settings.prefix,
            suffix: originalPs.text_property_settings.suffix,
            date_created: new Date().toISOString(),
            date_modified: new Date().toISOString(),
          }),
        )
      }

      if (originalPs.dimension_property_settings) {
        detailInserts.push(
          supabaseClient.from('dimension_property_settings').insert({
            property_setting_id: newPs.id,
            dimension: originalPs.dimension_property_settings.dimension,
            anchor_position: originalPs.dimension_property_settings.anchor_position,
            preserve_aspect_ratio: originalPs.dimension_property_settings.preserve_aspect_ratio,
            date_created: new Date().toISOString(),
            date_modified: new Date().toISOString(),
          }),
        )
      }

      // Check if this property has numeric settings (either nested or top-level)
      // The state may have min/max at top level (merged from numeric_property_settings)
      const numericMin = originalPs.numeric_property_settings?.min ?? (originalPs as any).min
      const numericMax = originalPs.numeric_property_settings?.max ?? (originalPs as any).max
      const numericOperator = originalPs.numeric_property_settings?.operator ?? (originalPs as any).operator

      if (numericMin !== undefined || numericMax !== undefined || numericOperator !== undefined) {
        // Note: numeric_property_settings table does NOT have date_created or date_modified columns
        detailInserts.push(
          supabaseClient.from('numeric_property_settings').insert({
            property_setting_id: newPs.id,
            min: numericMin ?? 0,
            max: numericMax ?? 100,
            operator: numericOperator ?? 'add',
          }),
        )
      }

      if (originalPs.list_property_settings) {
        // Note: list_property_settings table does NOT have date_created or date_modified columns
        const optionsArray = originalPs.list_property_settings.options
        const optionsString = Array.isArray(optionsArray)
          ? optionsArray.join('\n')
          : String(optionsArray || '')
        detailInserts.push(
          supabaseClient.from('list_property_settings').insert({
            property_setting_id: newPs.id,
            options: optionsString,
          }),
        )
      }
    }

    await Promise.all(detailInserts)

    return updatedPreset
  } finally {
    endNetworkActivity()
  }
}

export async function updatePresetVisibility(
  presetId: string,
  figmaUserId: string,
  visibility: 'private' | 'public',
): Promise<Database['public']['Tables']['presets']['Row']> {
  startNetworkActivity()
  try {
    // Verify preset belongs to user
    const { data: preset, error: presetError } = await supabaseClient
      .from('presets')
      .select('*')
      .eq('id', presetId)
      .eq('figma_user_id', figmaUserId)
      .single()

    if (presetError || !preset) {
      console.error('Error fetching preset for visibility update:', presetError)
      throw new Error('Preset not found or access denied')
    }

    const { data: updatedPreset, error: updateError } = await supabaseClient
      .from('presets')
      .update({
        visibility,
        date_modified: new Date().toISOString(),
      })
      .eq('id', presetId)
      .select()
      .single()

    if (updateError || !updatedPreset) {
      console.error('Error updating preset visibility:', updateError)
      throw new Error('Failed to update preset visibility')
    }

    return updatedPreset
  } finally {
    endNetworkActivity()
  }
}

export async function updatePresetLabel(
  presetId: string,
  figmaUserId: string,
  newLabel: string,
): Promise<Database['public']['Tables']['presets']['Row']> {
  startNetworkActivity()
  try {
    // Verify preset belongs to user
    const { data: preset, error: presetError } = await supabaseClient
      .from('presets')
      .select('*')
      .eq('id', presetId)
      .eq('figma_user_id', figmaUserId)
      .single()

    if (presetError || !preset) {
      console.error('Error fetching preset for label update:', presetError)
      throw new Error('Preset not found or access denied')
    }

    const { data: updatedPreset, error: updateError } = await supabaseClient
      .from('presets')
      .update({
        label: newLabel,
        date_modified: new Date().toISOString(),
      })
      .eq('id', presetId)
      .select()
      .single()

    if (updateError || !updatedPreset) {
      console.error('Error updating preset label:', updateError)
      throw new Error('Failed to update preset label')
    }

    return updatedPreset
  } finally {
    endNetworkActivity()
  }
}
