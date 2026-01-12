import { endNetworkActivity, startNetworkActivity } from '@/lib/utils/networkActivity'
import { supabaseClient } from '@/supabase/client'
import { Database } from '@/supabase/generated-types'

export type PropertySettingsWithDetails = Database['public']['Tables']['property_settings']['Row'] & {
  text_property_settings?: Database['public']['Tables']['text_property_settings']['Row'] | null
  dimension_property_settings?: Database['public']['Tables']['dimension_property_settings']['Row'] | null
  numeric_property_settings?: Database['public']['Tables']['numeric_property_settings']['Row'] | null
  list_property_settings?: Database['public']['Tables']['list_property_settings']['Row'] | null
  // Flattened properties for convenience
  min?: number | null
  max?: number | null
  operator?: string | null
  decimal_places?: number | null
  prefix?: string | null
  suffix?: string | null
  thousands_separator?: string | null
  anchor_position?: Database['public']['Enums']['anchor_position'] | null
  dimension?: string | null
  preserve_aspect_ratio?: boolean | null
  modeOptions?: any
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

export async function bulkDisableProperties(
  propertySettingIds: string[]
): Promise<void> {
  if (propertySettingIds.length === 0) return

  const { error } = await supabaseClient
    .from('property_settings')
    .update({
      is_enabled: false,
      date_modified: new Date().toISOString()
    })
    .in('id', propertySettingIds)

  if (error) {
    console.error('Error bulk disabling properties:', error)
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

function getSortOrderForMode(
  ps: PropertySettingsWithDetails,
  mode: Database['public']['Enums']['randomization_mode']
): Database['public']['Enums']['post_randomization_sort_order'] {
  // Access mode-specific sort order properties that exist in the database but aren't in the type
  const psAny = ps as any
  switch (mode) {
    case 'range':
      return (psAny.post_range_randomization_sort_order as Database['public']['Enums']['post_randomization_sort_order']) ?? 'none'
    case 'list':
      return (psAny.post_list_randomization_sort_order as Database['public']['Enums']['post_randomization_sort_order']) ?? 'none'
    case 'addition':
      return (psAny.post_addition_randomization_sort_order as Database['public']['Enums']['post_randomization_sort_order']) ?? 'none'
    case 'multiplication':
      return (psAny.post_multiplication_randomization_sort_order as Database['public']['Enums']['post_randomization_sort_order']) ?? 'none'
    default:
      return 'none'
  }
}

function propertySettingToDbFormat(ps: PropertySettingsWithDetails) {
  return {
    label: ps.label,
    randomization_mode: ps.randomization_mode,
    post_range_randomization_sort_order: getSortOrderForMode(ps, 'range'),
    post_list_randomization_sort_order: getSortOrderForMode(ps, 'list'),
    post_addition_randomization_sort_order: getSortOrderForMode(ps, 'addition'),
    post_multiplication_randomization_sort_order: getSortOrderForMode(ps, 'multiplication'),
    is_enabled: ps.is_enabled,
  }
}

export async function updatePropertySettingSortOrder(
  propertySettingId: string,
  randomizationMode: Database['public']['Enums']['randomization_mode'],
  sortOrder: Database['public']['Enums']['post_randomization_sort_order']
): Promise<void> {
  const columnMap: Record<Database['public']['Enums']['randomization_mode'], string> = {
    range: 'post_range_randomization_sort_order',
    list: 'post_list_randomization_sort_order',
    addition: 'post_addition_randomization_sort_order',
    multiplication: 'post_multiplication_randomization_sort_order',
    chatgpt: 'post_randomization_sort_order', // chatgpt mode uses the generic field
  }

  const columnName = columnMap[randomizationMode]

  const { error } = await supabaseClient
    .from('property_settings')
    .update({
      [columnName]: sortOrder,
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

    // Admin users can see the default preset
    let defaultPreset: Database['public']['Tables']['presets']['Row'] | null = null
    if (isAdmin) {
      const { data: defaultPresetData } = await supabaseClient
        .from('presets')
        .select('*')
        .eq('figma_user_id', 'default')
        .eq('label', '__default__')
        .maybeSingle()

      defaultPreset = defaultPresetData || null
    }

    // Combine: user's presets first, then default preset (if admin), then public presets from others
    // User's presets are already sorted by date_modified DESC
    const allPresets = [
      ...(userPresets || []),
      ...(defaultPreset ? [defaultPreset] : []),
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
  visibility: 'private' | 'public' | 'hidden' = 'private',
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
      ...propertySettingToDbFormat(ps),
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

  // Create map for quick lookup
  const propertySettingMap = new Map(
    newPropertySettings.map((ps, i) => [propertySettings[i].label, ps])
  )

  // Prepare bulk inserts for detail settings
  const textSettingsToInsert: any[] = []
  const dimensionSettingsToInsert: any[] = []
  const numericSettingsToInsert: any[] = []
  const listSettingsToInsert: any[] = []

  for (const originalPs of propertySettings) {
    const newPs = propertySettingMap.get(originalPs.label)
    if (!newPs) continue

    if (originalPs.text_property_settings) {
      textSettingsToInsert.push({
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
      dimensionSettingsToInsert.push({
        property_setting_id: newPs.id,
        dimension: originalPs.dimension_property_settings.dimension,
        anchor_position: originalPs.dimension_property_settings.anchor_position,
        preserve_aspect_ratio: originalPs.dimension_property_settings.preserve_aspect_ratio,
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString(),
      })
    }

    const numericMin = originalPs.numeric_property_settings?.min ?? (originalPs as any).min
    const numericMax = originalPs.numeric_property_settings?.max ?? (originalPs as any).max
    const numericOperator = originalPs.numeric_property_settings?.operator ?? (originalPs as any).operator

    if (numericMin !== undefined || numericMax !== undefined || numericOperator !== undefined) {
      numericSettingsToInsert.push({
        property_setting_id: newPs.id,
        min: numericMin ?? 0,
        max: numericMax ?? 100,
        operator: numericOperator ?? 'add',
      })
    }

    if (originalPs.list_property_settings) {
      const optionsArray = originalPs.list_property_settings.options
      const optionsString = Array.isArray(optionsArray)
        ? optionsArray.join('\n')
        : String(optionsArray || '')
      listSettingsToInsert.push({
        property_setting_id: newPs.id,
        options: optionsString,
      })
    }
  }

  // Bulk insert all detail settings in parallel
  const detailOperations: Promise<any>[] = []

  if (textSettingsToInsert.length > 0) {
    detailOperations.push(
      Promise.resolve(
        supabaseClient
          .from('text_property_settings')
          .insert(textSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    )
  }

  if (dimensionSettingsToInsert.length > 0) {
    detailOperations.push(
      Promise.resolve(
        supabaseClient
          .from('dimension_property_settings')
          .insert(dimensionSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    )
  }

  if (numericSettingsToInsert.length > 0) {
    detailOperations.push(
      Promise.resolve(
        supabaseClient
          .from('numeric_property_settings')
          .insert(numericSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    )
  }

  if (listSettingsToInsert.length > 0) {
    detailOperations.push(
      Promise.resolve(
        supabaseClient
          .from('list_property_settings')
          .insert(listSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    )
  }

  await Promise.all(detailOperations)

    return preset
  } finally {
    endNetworkActivity()
  }
}

export async function duplicatePreset(
  sourcePresetId: string,
  figmaUserId: string,
  visibility: 'private' | 'public' | 'hidden' = 'hidden',
): Promise<Database['public']['Tables']['presets']['Row']> {
  startNetworkActivity()
  try {
    // Load the source preset's property settings
    const sourcePropertySettings = await loadPreset(sourcePresetId)

    if (sourcePropertySettings.length === 0) {
      throw new Error('Source preset has no property settings')
    }

    // Create a new preset with the same settings
    const newPreset = await createPreset(
      figmaUserId,
      `__duplicate_${Date.now()}__`,
      sourcePropertySettings,
      visibility,
    )

    return newPreset
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
      .maybeSingle()

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

export async function bulkPopulatePreset(
  presetId: string,
  figmaUserId: string,
  propertySettings: PropertySettingsWithDetails[],
): Promise<void> {
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
      console.error('Error fetching preset for bulk populate:', presetError)
      throw new Error('Preset not found or access denied')
    }

    // Update preset metadata (date_modified)
    await supabaseClient
      .from('presets')
      .update({
        date_modified: new Date().toISOString(),
      })
      .eq('id', presetId)

    // Bulk insert all property settings at once
    const propertySettingsToInsert = propertySettings.map(ps => ({
      ...propertySettingToDbFormat(ps),
      preset_id: presetId,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    }))

    const { data: insertedPropertySettings, error: insertError } = await supabaseClient
      .from('property_settings')
      .insert(propertySettingsToInsert)
      .select()

    if (insertError) {
      console.error('Error bulk inserting property settings:', insertError)
      throw insertError
    }

    // Create map for quick lookup
    const propertySettingMap = new Map(
      insertedPropertySettings.map(ps => [ps.label, ps])
    )

    // Prepare bulk inserts for detail settings
    const textSettingsToInsert: any[] = []
    const dimensionSettingsToInsert: any[] = []
    const numericSettingsToInsert: any[] = []
    const listSettingsToInsert: any[] = []

    for (const originalPs of propertySettings) {
      const insertedPs = propertySettingMap.get(originalPs.label)
      if (!insertedPs) continue

      if (originalPs.text_property_settings) {
        textSettingsToInsert.push({
          property_setting_id: insertedPs.id,
          decimal_places: originalPs.text_property_settings.decimal_places,
          thousands_separator: originalPs.text_property_settings.thousands_separator,
          prefix: originalPs.text_property_settings.prefix,
          suffix: originalPs.text_property_settings.suffix,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
        })
      }

      if (originalPs.dimension_property_settings) {
        dimensionSettingsToInsert.push({
          property_setting_id: insertedPs.id,
          dimension: originalPs.dimension_property_settings.dimension,
          anchor_position: originalPs.dimension_property_settings.anchor_position,
          preserve_aspect_ratio: originalPs.dimension_property_settings.preserve_aspect_ratio,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
        })
      }

      const numericMin = originalPs.numeric_property_settings?.min ?? (originalPs as any).min
      const numericMax = originalPs.numeric_property_settings?.max ?? (originalPs as any).max
      const numericOperator = originalPs.numeric_property_settings?.operator ?? (originalPs as any).operator

      if (numericMin !== undefined || numericMax !== undefined || numericOperator !== undefined) {
        numericSettingsToInsert.push({
          property_setting_id: insertedPs.id,
          min: numericMin ?? 0,
          max: numericMax ?? 100,
          operator: numericOperator ?? 'add',
        })
      }

      if (originalPs.list_property_settings) {
        const optionsArray = originalPs.list_property_settings.options
        const optionsString = Array.isArray(optionsArray)
          ? optionsArray.join('\n')
          : String(optionsArray || '')
        listSettingsToInsert.push({
          property_setting_id: insertedPs.id,
          options: optionsString,
        })
      }
    }

    // Bulk insert all detail settings in parallel
    const detailOperations: Promise<any>[] = []

    if (textSettingsToInsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('text_property_settings')
          .insert(textSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    }

    if (dimensionSettingsToInsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('dimension_property_settings')
          .insert(dimensionSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    }

    if (numericSettingsToInsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('numeric_property_settings')
          .insert(numericSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    }

    if (listSettingsToInsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('list_property_settings')
          .insert(listSettingsToInsert)
          .then(() => undefined) as Promise<void>
      )
    }

    await Promise.all(detailOperations)
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
    const isAdmin = figmaUserId === '321070720595916577'

    // Fetch preset to verify access
    const { data: preset, error: presetError } = await supabaseClient
      .from('presets')
      .select('*')
      .eq('id', presetId)
      .single()

    if (presetError || !preset) {
      console.error('Error fetching preset for update:', presetError)
      throw new Error('Preset not found or access denied')
    }

    // Verify preset belongs to user (or is default preset for admin)
    const isDefaultPreset = preset.label === '__default__' && preset.figma_user_id === 'default'
    const belongsToUser = preset.figma_user_id === figmaUserId

    if (!belongsToUser && !(isAdmin && isDefaultPreset)) {
      throw new Error('Preset not found or access denied')
    }

    // Prevent modification of default preset by non-admin users
    if (preset.label === '__default__' && !isAdmin) {
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

    // Get existing property settings to determine what to delete
    const { data: existingSettings } = await supabaseClient
      .from('property_settings')
      .select('id, label')
      .eq('preset_id', presetId)

    const existingLabels = new Set(existingSettings?.map((ps) => ps.label) || [])
    const newLabels = new Set(propertySettings.map((ps) => ps.label))

    // Delete properties that are not in the new settings
    const labelsToDelete = Array.from(existingLabels).filter(
      (label) => !newLabels.has(label),
    )
    if (labelsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('property_settings')
        .delete()
        .eq('preset_id', presetId)
        .in('label', labelsToDelete)

      if (deleteError) {
        console.error('Error deleting removed property settings:', deleteError)
        throw deleteError
      }
    }

    // Separate existing and new property settings for bulk operations
    const existingMap = new Map(
      existingSettings?.map((ps) => [ps.label, ps.id]) || []
    )
    const toUpdate: any[] = []
    const toInsert: any[] = []

    for (const ps of propertySettings) {
      const propertySettingData = {
        ...propertySettingToDbFormat(ps),
        preset_id: presetId,
        date_modified: new Date().toISOString(),
      }

      if (existingMap.has(ps.label)) {
        toUpdate.push({
          ...propertySettingData,
          id: existingMap.get(ps.label),
        })
      } else {
        toInsert.push({
          ...propertySettingData,
          date_created: new Date().toISOString(),
        })
      }
    }

    // Bulk update existing property settings
    const updatePromises = toUpdate.map((ps) =>
      supabaseClient
        .from('property_settings')
        .update({
          randomization_mode: ps.randomization_mode,
          post_range_randomization_sort_order: ps.post_range_randomization_sort_order,
          post_list_randomization_sort_order: ps.post_list_randomization_sort_order,
          post_addition_randomization_sort_order: ps.post_addition_randomization_sort_order,
          post_multiplication_randomization_sort_order: ps.post_multiplication_randomization_sort_order,
          is_enabled: ps.is_enabled,
          date_modified: ps.date_modified,
        })
        .eq('id', ps.id)
        .select()
        .single()
    )

    // Bulk insert new property settings
    let insertedPropertySettings: any[] = []
    if (toInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('property_settings')
        .insert(toInsert)
        .select()

      if (insertError) {
        console.error('Error bulk inserting property settings:', insertError)
        throw insertError
      }
      insertedPropertySettings = inserted || []
    }

    // Wait for all updates to complete
    const updateResults = await Promise.all(updatePromises)
    const updatedPropertySettings = updateResults
      .filter((result) => result.data)
      .map((result) => result.data)

    // Combine updated and inserted settings
    const upsertedPropertySettings = [...updatedPropertySettings, ...insertedPropertySettings]

    // Create map for quick lookup
    const upsertedMap = new Map(
      upsertedPropertySettings.map((ps) => [ps.label, ps])
    )

    // Prepare bulk inserts/updates for detail settings
    const textSettingsToUpsert: any[] = []
    const dimensionSettingsToUpsert: any[] = []
    const numericSettingsToUpsert: any[] = []
    const listSettingsToUpsert: any[] = []

    for (const originalPs of propertySettings) {
      const upsertedPs = upsertedMap.get(originalPs.label)
      if (!upsertedPs) continue

      if (originalPs.text_property_settings) {
        textSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          decimal_places: originalPs.text_property_settings.decimal_places,
          thousands_separator: originalPs.text_property_settings.thousands_separator,
          prefix: originalPs.text_property_settings.prefix,
          suffix: originalPs.text_property_settings.suffix,
        })
      }

      if (originalPs.dimension_property_settings) {
        dimensionSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          dimension: originalPs.dimension_property_settings.dimension,
          anchor_position: originalPs.dimension_property_settings.anchor_position,
          preserve_aspect_ratio: originalPs.dimension_property_settings.preserve_aspect_ratio,
        })
      }

      const numericMin = originalPs.numeric_property_settings?.min ?? (originalPs as any).min
      const numericMax = originalPs.numeric_property_settings?.max ?? (originalPs as any).max
      const numericOperator = originalPs.numeric_property_settings?.operator ?? (originalPs as any).operator

      if (numericMin !== undefined || numericMax !== undefined || numericOperator !== undefined) {
        numericSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          min: numericMin ?? 0,
          max: numericMax ?? 100,
          operator: numericOperator ?? 'add',
        })
      }

      if (originalPs.list_property_settings) {
        const optionsArray = originalPs.list_property_settings.options
        const optionsString = Array.isArray(optionsArray)
          ? optionsArray.join('\n')
          : String(optionsArray || '')
        listSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          options: optionsString,
        })
      }
    }

    // Bulk upsert all detail settings in parallel
    const detailOperations: Promise<any>[] = []

    if (textSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('text_property_settings')
          .upsert(textSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    if (dimensionSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('dimension_property_settings')
          .upsert(dimensionSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    if (numericSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('numeric_property_settings')
          .upsert(numericSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    if (listSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('list_property_settings')
          .upsert(listSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    await Promise.all(detailOperations)

    return updatedPreset
  } finally {
    endNetworkActivity()
  }
}

export async function updatePresetMerge(
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
      console.error('Error fetching preset for merge:', presetError)
      throw new Error('Preset not found or access denied')
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

    // For local preset merge: only upsert properties from loaded preset
    // Don't delete properties that aren't in loaded preset (they should remain disabled)

    // Get existing property settings for this preset
    const { data: existingSettings } = await supabaseClient
      .from('property_settings')
      .select('id, label')
      .eq('preset_id', presetId)

    const existingMap = new Map(
      existingSettings?.map((ps) => [ps.label, ps.id]) || []
    )
    const toUpdate: any[] = []
    const toInsert: any[] = []

    for (const ps of propertySettings) {
      const propertySettingData = {
        ...propertySettingToDbFormat(ps),
        preset_id: presetId,
        date_modified: new Date().toISOString(),
      }

      if (existingMap.has(ps.label)) {
        toUpdate.push({
          ...propertySettingData,
          id: existingMap.get(ps.label),
        })
      } else {
        toInsert.push({
          ...propertySettingData,
          date_created: new Date().toISOString(),
        })
      }
    }

    // Bulk update existing property settings
    const updatePromises = toUpdate.map((ps) =>
      supabaseClient
        .from('property_settings')
        .update({
          randomization_mode: ps.randomization_mode,
          post_range_randomization_sort_order: ps.post_range_randomization_sort_order,
          post_list_randomization_sort_order: ps.post_list_randomization_sort_order,
          post_addition_randomization_sort_order: ps.post_addition_randomization_sort_order,
          post_multiplication_randomization_sort_order: ps.post_multiplication_randomization_sort_order,
          is_enabled: ps.is_enabled,
          date_modified: ps.date_modified,
        })
        .eq('id', ps.id)
        .select()
        .single()
    )

    // Bulk insert new property settings
    let insertedPropertySettings: any[] = []
    if (toInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('property_settings')
        .insert(toInsert)
        .select()

      if (insertError) {
        console.error('Error bulk inserting property settings:', insertError)
        throw insertError
      }
      insertedPropertySettings = inserted || []
    }

    // Wait for all updates to complete
    const updateResults = await Promise.all(updatePromises)
    const updatedPropertySettings = updateResults
      .filter((result) => result.data)
      .map((result) => result.data)

    // Combine updated and inserted settings
    const upsertedPropertySettings = [...updatedPropertySettings, ...insertedPropertySettings]

    // Create map for quick lookup
    const upsertedMap = new Map(
      upsertedPropertySettings.map((ps) => [ps.label, ps])
    )

    // Prepare bulk inserts/updates for detail settings
    const textSettingsToUpsert: any[] = []
    const dimensionSettingsToUpsert: any[] = []
    const numericSettingsToUpsert: any[] = []
    const listSettingsToUpsert: any[] = []

    for (const originalPs of propertySettings) {
      const upsertedPs = upsertedMap.get(originalPs.label)
      if (!upsertedPs) continue

      if (originalPs.text_property_settings) {
        textSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          decimal_places: originalPs.text_property_settings.decimal_places,
          thousands_separator: originalPs.text_property_settings.thousands_separator,
          prefix: originalPs.text_property_settings.prefix,
          suffix: originalPs.text_property_settings.suffix,
        })
      }

      if (originalPs.dimension_property_settings) {
        dimensionSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          dimension: originalPs.dimension_property_settings.dimension,
          anchor_position: originalPs.dimension_property_settings.anchor_position,
          preserve_aspect_ratio: originalPs.dimension_property_settings.preserve_aspect_ratio,
        })
      }

      const numericMin = originalPs.numeric_property_settings?.min ?? (originalPs as any).min
      const numericMax = originalPs.numeric_property_settings?.max ?? (originalPs as any).max
      const numericOperator = originalPs.numeric_property_settings?.operator ?? (originalPs as any).operator

      if (numericMin !== undefined || numericMax !== undefined || numericOperator !== undefined) {
        numericSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          min: numericMin ?? 0,
          max: numericMax ?? 100,
          operator: numericOperator ?? 'add',
        })
      }

      if (originalPs.list_property_settings) {
        const optionsArray = originalPs.list_property_settings.options
        const optionsString = Array.isArray(optionsArray)
          ? optionsArray.join('\n')
          : String(optionsArray || '')
        listSettingsToUpsert.push({
          property_setting_id: upsertedPs.id,
          options: optionsString,
        })
      }
    }

    // Bulk upsert all detail settings in parallel
    const detailOperations: Promise<any>[] = []

    if (textSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('text_property_settings')
          .upsert(textSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    if (dimensionSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('dimension_property_settings')
          .upsert(dimensionSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    if (numericSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('numeric_property_settings')
          .upsert(numericSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    if (listSettingsToUpsert.length > 0) {
      detailOperations.push(
        supabaseClient
          .from('list_property_settings')
          .upsert(listSettingsToUpsert, { onConflict: 'property_setting_id' })
          .then(() => undefined) as Promise<void>
      )
    }

    await Promise.all(detailOperations)

    return updatedPreset
  } finally {
    endNetworkActivity()
  }
}

export async function updatePresetVisibility(
  presetId: string,
  figmaUserId: string,
  visibility: 'private' | 'public' | 'hidden',
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
