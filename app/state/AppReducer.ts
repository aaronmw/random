import { AppState, PropertyName, PropertySettingsRow } from '@/app/types'
import { deletePreset, upsertPreset } from '@/lib/services/presetService'
import { PropertySettingsWithDetails } from '@/lib/services/propertySettingsService'
import { produce } from 'immer'
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import isEqual from 'lodash/isEqual'
import mapValues from 'lodash/mapValues'
import merge from 'lodash/merge'
import omit from 'lodash/omit'
import set from 'lodash/set'

export const initialState: AppState = {
  currentUserId: '321070720595916577',
  dispatch: () => {},
  isAutoScrollEnabled: false,
  isGroupedByStatus: false,
  isGroupedByType: false,
  isLightMode: false,
  presets: [],
  propertySettings: {},
  selectedNodePluginData: [],
}

export const TABLE_HANDLERS = {
  presets: {
    path: 'presets',
    handleDelete: (state: AppState, oldData: any) => ({
      presets: filter(state.presets, ([label]) => label !== oldData.label),
    }),
    handleUpsert: (state: AppState, newData: any) => {
      const existingIndex = findIndex(
        state.presets,
        ([label]) => label === newData.label,
      )

      const newPresets = [...state.presets]
      if (existingIndex >= 0) {
        newPresets[existingIndex] = [newData.label, newData.property_settings]
      } else {
        newPresets.push([newData.label, newData.property_settings])
      }

      return { presets: newPresets }
    },
  },
  property_settings: {
    path: 'propertySettings',
    handleDelete: (state: AppState, oldData: any) => ({
      propertySettings: omit(state.propertySettings, [oldData.id]),
    }),
    handleUpsert: (state: AppState, newData: any) => ({
      propertySettings: merge({}, state.propertySettings, {
        [newData.id]: newData,
      }),
    }),
  },
} as const

export type AppAction =
  | {
      type: 'setSelectedNodePluginData'
      payload: {
        partialPropertySettings: Partial<PropertySettingsRow>
      }
    }
  | {
      type: 'setInitialData'
      payload: {
        propertySettings: PropertySettingsWithDetails[]
        presets: any[]
        currentUserId: string | null
      }
    }
  | {
      type: 'setPreserveAspectRatio'
      payload: {
        preserveAspectRatio: boolean
        propertyName: PropertyName
      }
    }
  | {
      type: 'setStateByPath'
      payload: {
        path: string
        value: any
      }
    }
  | {
      type: 'handleDatabaseChange'
      payload: {
        table: keyof typeof TABLE_HANDLERS
        event: 'INSERT' | 'UPDATE' | 'DELETE'
        new: any
        old: any
      }
    }
  | {
      type: 'upsertPreset'
      payload: {
        id?: number
        label: string
        propertySettings: Partial<PropertySettingsRow>
      }
    }
  | {
      type: 'deletePreset'
      payload: {
        id: number
      }
    }

export const AppReducer = (state: AppState, action: AppAction) => {
  if (typeof action === 'undefined') {
    return state
  }

  const newState = produce(state, (draft) => {
    switch (action.type) {
      case 'setInitialData': {
        const { propertySettings, presets, currentUserId } = action.payload

        draft.currentUserId = currentUserId

        const propertySettingsMap = propertySettings.reduce((acc, ps) => {
          acc[ps.label] = ps
          return acc
        }, {} as Record<string, PropertySettingsWithDetails>)

        draft.propertySettings = propertySettingsMap
        draft.presets = presets.map(preset => [preset.label, {}])
        break
      }

      case 'handleDatabaseChange': {
        const { table, event, new: newData, old: oldData } = action.payload
        const handler = TABLE_HANDLERS[table]

        if (!handler) {
          console.warn(`No handler found for table: ${table}`)
          return
        }

        const updates =
          event === 'DELETE'
            ? handler.handleDelete(state, oldData)
            : handler.handleUpsert(state, newData)

        mapValues(updates, (value, key) => {
          set(draft, key, value)
        })
        break
      }

      case 'setSelectedNodePluginData': {
        const { partialPropertySettings } = action.payload

        const recognizedProperties = Object.fromEntries(
          Object.entries(partialPropertySettings).filter(
            ([key]) => draft.propertySettings && key in draft.propertySettings,
          ),
        )

        if (draft.propertySettings) {
          mapValues(
            draft.propertySettings,
            (propertySettings: Partial<PropertySettingsRow>) => {
              if (!propertySettings) return
              propertySettings.is_enabled = false
            },
          )
        }

        merge(draft.propertySettings, recognizedProperties)
        break
      }

      case 'upsertPreset': {
        const { id, label, propertySettings } = action.payload

        upsertPreset({ id, label, propertySettings })
          .then((data) => {
            console.log('Preset saved:', data)
          })
          .catch((error) => {
            console.error('Failed to save preset:', error)
          })
        break
      }

      case 'deletePreset': {
        const { id } = action.payload

        deletePreset(id)
          .then(() => {
            console.log('Preset deleted')
          })
          .catch((error) => {
            console.error('Failed to delete preset:', error)
          })
        break
      }

      // case 'setPreserveAspectRatio': {
      //   const { preserveAspectRatio, propertyName } = action.payload

      //   const sideEffects = getSideEffectsForPreservingAspectRatio({
      //     preserveAspectRatio,
      //     propertyName,
      //     state: draft,
      //   })

      //   if (draft.propertySettings && propertyName in draft.propertySettings) {
      //     draft.propertySettings[propertyName].preserve_aspect_ratio =
      //       preserveAspectRatio
      //   }

      //   sideEffects.forEach(([path, value]) => {
      //     set(draft, path, value)
      //   })
      //   break
      // }

      case 'setStateByPath': {
        const { path, value } = action.payload
        set(draft, path, value)
        break
      }
    }
  })

  const stateHasChanged = !isEqual(state, newState)

  console.log(
    `App action ${action.type} fired${!stateHasChanged ? ', but no state change' : ''}:`,
    {
      action,
      prevState: state,
      newState,
    },
  )

  return stateHasChanged ? newState : state
}
