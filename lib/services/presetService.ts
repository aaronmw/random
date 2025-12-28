import { PropertySettingsRow } from '@/app/types'
import { supabaseClient } from '@/supabase/client'

export async function upsertPreset({
  id,
  label,
  propertySettings,
}: {
  id?: number
  label: string
  propertySettings: Partial<PropertySettingsRow>
}) {
  const { data, error } = await supabaseClient
    .from('presets')
    .upsert({
      id,
      label,
      property_settings: propertySettings,
      date_modified: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePreset(id: number) {
  const { error } = await supabaseClient
    .from('presets')
    .delete()
    .eq('id', id)

  if (error) throw error
}
