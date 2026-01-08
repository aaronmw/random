import { supabaseClient } from '@/supabase/client'
import { Database } from '@/supabase/generated-types'
import {
  startNetworkActivity,
  endNetworkActivity,
} from '@/lib/utils/networkActivity'

export type UserOptions = {
  id: string
  figma_user_id: string
  is_auto_scroll_enabled: boolean
  is_grouped_by_status: boolean
  is_grouped_by_type: boolean
  is_light_mode: boolean
  date_created: string
  date_modified: string
}

export async function getUserOptions(
  figmaUserId: string,
): Promise<UserOptions | null> {
  startNetworkActivity()
  try {
    const { data, error } = await supabaseClient
      .from('user_options')
      .select('*')
      .eq('figma_user_id', figmaUserId)
      .maybeSingle()

    if (error) {
      // Check if table doesn't exist (PGRST116 = relation does not exist)
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('user_options table does not exist yet. Migration may need to be run.')
        return null
      }
      console.error('Error fetching user options:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return null
    }

    return data as UserOptions | null
  } finally {
    endNetworkActivity()
  }
}

export async function getOrCreateUserOptions(
  figmaUserId: string,
): Promise<UserOptions | null> {
  startNetworkActivity()
  try {
    // Check if user options exist
    const existing = await getUserOptions(figmaUserId)

    if (existing) {
      return existing
    }

    // Create default options
    const { data, error } = await supabaseClient
      .from('user_options')
      .insert({
        figma_user_id: figmaUserId,
        is_auto_scroll_enabled: false,
        is_grouped_by_status: false,
        is_grouped_by_type: false,
        is_light_mode: false,
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return null and use defaults
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('user_options table does not exist yet. Using default options. Migration may need to be run.')
        return null
      }
      console.error('Error creating user options:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }

    return data as UserOptions
  } finally {
    endNetworkActivity()
  }
}

export async function updateUserOptions(
  figmaUserId: string,
  updates: Partial<{
    is_auto_scroll_enabled: boolean
    is_grouped_by_status: boolean
    is_grouped_by_type: boolean
    is_light_mode: boolean
  }>,
): Promise<UserOptions | null> {
  startNetworkActivity()
  try {
    const { data, error } = await supabaseClient
      .from('user_options')
      .update({
        ...updates,
        date_modified: new Date().toISOString(),
      })
      .eq('figma_user_id', figmaUserId)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return null (options will use defaults)
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('user_options table does not exist yet. Cannot update options. Migration may need to be run.')
        return null
      }
      console.error('Error updating user options:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }

    return data as UserOptions
  } finally {
    endNetworkActivity()
  }
}
