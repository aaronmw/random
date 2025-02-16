export type AppAction =
  | {
      type: 'setPreserveAspectRatio'
      payload: {
        propertyName: PropertyName
        preserveAspectRatio: boolean
      }
    }
  | {
      type: 'loadPropertySettings'
      payload: {
        loadedProperties: Partial<PropertySettingsObject>
      }
    }
  | {
      type: 'setStateByPath'
      payload: {
        path: string
        value: unknown
      }
    }
  | {
      type: 'setSelectionCount'
      payload: {
        count: number
      }
    }

export type PluginAction =
  | {
      type: 'execute'
      payload: {
        propertySettings: PropertySettingsObject
      }
    }
  | {
      type: 'requestSettingsFromSelectedNodes'
    }
  | {
      type: 'setPluginHeight'
      payload: {
        height: number
      }
    }
  | {
      type: 'saveSettingsToSelectedNodes'
      payload: {
        propertySettings: PropertySettingsObject
      }
    }

export const DATA_TYPES = {
  int: {
    label: 'Signed Integer',
    min: -9999,
    max: 9999,
  },
  uint: {
    label: 'Unsigned Integer',
    min: 0,
    max: 9999,
  },
  udegree: {
    label: 'Unsigned Degree',
    min: 0,
    max: 9999,
  },
  degree: {
    label: 'Degree',
    min: -9999,
    max: 9999,
  },
  percent: {
    label: 'Percentage',
    min: 0,
    max: 100,
  },
  pointCount: {
    min: 3,
    max: 100,
  },
  color: {
    label: 'Color',
  },
  string: {
    label: 'String',
    min: Infinity * -1,
    max: Infinity,
  },
} as const

export type DataType = keyof typeof DATA_TYPES

export const dataTypesByPropertyName = {
  arcEndingAngle: 'degree',
  arcInnerRadius: 'percent',
  arcStartingAngle: 'degree',
  bottomLeftRadius: 'uint',
  bottomRadii: 'uint',
  bottomRightRadius: 'uint',
  cornerRadius: 'uint',
  fillColor: 'color',
  fillColorAlphaChannel: 'uint',
  fillColorBlueChannel: 'uint',
  fillColorBrightness: 'percent',
  fillColorGreenChannel: 'uint',
  fillColorHue: 'udegree',
  fillColorLightness: 'percent',
  fillColorRedChannel: 'uint',
  fillColorSaturation: 'percent',
  fillOpacity: 'percent',
  height: 'uint',
  innerRadius: 'percent',
  layerBlur: 'uint',
  leftRadii: 'uint',
  opacity: 'percent',
  pointCount: 'pointCount',
  position: 'string', // TODO: Build this out
  rightRadii: 'uint',
  rotation: 'degree',
  strokeBottomWeight: 'uint',
  strokeColor: 'color',
  strokeLeftWeight: 'uint',
  strokeOpacity: 'percent',
  strokeRightWeight: 'uint',
  strokeTopWeight: 'uint',
  strokeWeight: 'uint',
  text: 'string',
  topLeftRadius: 'uint',
  topRadii: 'uint',
  topRightRadius: 'uint',
  width: 'uint',
  x: 'int',
  y: 'int',
} satisfies Record<string, DataType>

export type PropertyName = keyof typeof dataTypesByPropertyName

// export type PropertySettingsObject = Record<PropertyName, PropertySettings>
export type PropertySettingsObject = {
  [key in PropertyName]: PropertySettings
}

export interface AppState {
  propertySettings: PropertySettingsObject
  savedPropertySettings: [label: string, PropertySettingsObject][]
  selectionCount: number
}

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

export type RandomizationType = 'calc' | 'list' | 'range'

export type PropertySettings = {
  anchorPosition?: AnchorPosition
  corners?: ('topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft')[]
  disabled: boolean
  mode: 'calc' | 'list' | 'range'
  modeOptions: {
    calc?: {
      add: {
        max: number
        min: number
      }
      decimalPlaces: number
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
  }
  prefix?: string
  preserveAspectRatio?: boolean
  sortOrder: 'asc' | 'desc' | 'random'
  suffix?: string
  thousandsSeparator?: ' ' | ',' | ''
}
