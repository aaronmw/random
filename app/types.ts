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
  isGroupedByStatus: boolean
  isGroupedByType: boolean
  isLightMode: boolean
  presets: [label: string, Partial<PropertySettingsRow>][]
  propertySettings: Record<string, PropertySettingsWithDetails>
  selectedNodePluginData: Partial<PropertySettingsRow>[]
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
        propertySettings: Partial<PropertySettingsRow>[]
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

export type PropertyName = keyof typeof dataTypesByPropertyName

export type RandomizationMode = Database['public']['Enums']['randomization_mode']

export type SideEffect = [path: string, newValue: unknown]

export type PropertySettingsRow = Database['public']['Tables']['property_settings']['Row']
