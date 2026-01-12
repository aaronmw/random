import { AppAction } from '@/app/state/AppReducer'
import { dataTypes } from '@/lib/dataTypes'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'
import { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import { Database } from '@/supabase/generated-types'
import { Dispatch } from 'react'

export type AnchorPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type PluginToAppMessage = {
  type: 'setSelectedNodePluginData'
  payload: Partial<PropertySettingsRow>[]
}

export interface AppState {
  currentUserId: string | null
  dispatch: Dispatch<AppAction> | null
  isAutoScrollEnabled: boolean
  isFactoryResetting: boolean
  isUserSettingsChanging: boolean
  isPresetLoading: boolean
  isGroupedByStatus: boolean
  isGroupedByType: boolean
  isLightMode: boolean
  isAutoLoadFromSelectedNodes: boolean
  presets: Array<{ id: string; label: string; figma_user_id: string; visibility?: 'private' | 'public' | 'hidden' }>
  propertySettings: Record<string, PropertySettingsWithDetails>
  selectedNodePluginData: Partial<PropertySettingsRow>[]
  activePresetId: string | null // ID of the preset currently being edited (null = local preset)
  foundPresetId: string | null // ID of preset found on selected nodes (for manual loading)
  ignoreRealtimeUntil?: number // Timestamp - ignore realtime events until this time
  pendingPublicPresetChanges: Array<{
    table: 'presets'
    event: 'INSERT' | 'UPDATE' | 'DELETE'
    new: any
    old: any
  }>
}

export type DataType = keyof typeof dataTypes

export type DataTypeDescriptor = {
  label: string
  min: number | null
  max: number | null
  validator: ({
    value,
    min,
    max,
  }: {
    value: string
    min: number | null
    max: number | null
  }) => string | true
}

export type PluginAction =
  | {
      type: 'execute'
      payload: {
        propertySettings: Partial<Record<PropertyName, PropertySettingsWithDetails>>
      }
    }
  | {
      type: 'setPluginHeight'
      payload: {
        height: number
      }
    }
  | {
      type: 'upgrade'
    }
  | {
      type: 'getCurrentSelection'
    }
  | {
      type: 'setPresetIdOnNodes'
      payload: {
        presetId: string
      }
    }

export type PropertyName = keyof typeof dataTypesByPropertyName

export type RandomizationMode = Database['public']['Enums']['randomization_mode']

export type SideEffect = [path: string, newValue: unknown]

export type PropertySettingsRow = Database['public']['Tables']['property_settings']['Row']
