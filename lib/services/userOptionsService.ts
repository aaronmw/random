import {
    endNetworkActivity,
    startNetworkActivity,
} from '@/lib/utils/networkActivity'
import { supabaseClient } from '@/supabase/client'

export type UserOptions = {
  id: string
  figma_user_id: string
  is_auto_scroll_enabled: boolean
  is_grouped_by_status: boolean
  is_grouped_by_type: boolean
  is_light_mode: boolean
  is_auto_load_from_selected_nodes: boolean
  date_created: string
  date_modified: string
}

export async function getUserOptions(
  figmaUserId: string,
): Promise<UserOptions | null> {
  startNetworkActivity()
  try {
    const { data, error } = await (supabaseClient as any)
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

    return (data as unknown) as UserOptions | null
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

    // For test users, always use hardcoded defaults to ensure test isolation
    // Test users are identified by the 'test-user-' prefix
    const isTestUser = figmaUserId.startsWith('test-user-')

    // Get default user options (for figma_user_id = 'default') to use as template
    // Skip for test users to ensure they always start with known defaults
    const defaultUserOptions = isTestUser ? null : await getUserOptions('default')

    // Use default user options if available, otherwise use hardcoded defaults
    const defaultValues = defaultUserOptions
      ? {
          is_auto_scroll_enabled: defaultUserOptions.is_auto_scroll_enabled,
          is_grouped_by_status: defaultUserOptions.is_grouped_by_status,
          is_grouped_by_type: defaultUserOptions.is_grouped_by_type,
          is_light_mode: defaultUserOptions.is_light_mode,
          is_auto_load_from_selected_nodes: defaultUserOptions.is_auto_load_from_selected_nodes,
        }
      : {
          is_auto_scroll_enabled: false,
          is_grouped_by_status: false,
          is_grouped_by_type: false,
          is_light_mode: false,
          is_auto_load_from_selected_nodes: false,
        }

    // Create user options with defaults
    const { data, error } = await (supabaseClient as any)
      .from('user_options')
      .insert({
        figma_user_id: figmaUserId,
        ...defaultValues,
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
    is_auto_load_from_selected_nodes: boolean
  }>,
): Promise<UserOptions | null> {
  startNetworkActivity()
  try {
    const { data, error } = await (supabaseClient as any)
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
