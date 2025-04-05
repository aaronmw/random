import { dataTypes } from '@/lib/dataTypes'
import { dataTypesByPropertyName } from '@/lib/dataTypesByPropertyName'

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
  payload: Partial<PropertySettingsObject>[]
}

export interface AppState {
  presets: Record<string, Partial<PropertySettingsObject>>
  propertySettings: PropertySettingsObject
  selectedNodePluginData: Partial<PropertySettingsObject>[]
  isGroupedByType: boolean
  isGroupedByStatus: boolean
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
        propertySettings: Partial<PropertySettingsObject>
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

export type PropertySettings = {
  anchorPosition?: AnchorPosition
  corners?: ('topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft')[]
  decimalPlaces?: number
  decimalCharacter?: string
  isEnabled: boolean
  mode: RandomizationType
  prefix?: string
  preserveAspectRatio?: boolean
  sortOrder: 'asc' | 'desc' | 'random'
  suffix?: string
  thousandsSeparator?: string
  modeOptions: {
    calc?: {
      add: {
        max: number
        min: number
      }
      multiply: {
        max: number
        min: number
      }
      operator: 'add' | 'multiply'
    }
    list?: {
      options: (string | number)[]
    }
    range?: {
      max: number
      min: number
    }
    chatgpt?: {
      prompt: string
    }
  }
}

export type PropertySettingsObject = {
  [key in PropertyName]: PropertySettings
}

export type RandomizationType = 'calc' | 'list' | 'range'

export type SideEffect = [path: string, newValue: unknown]
