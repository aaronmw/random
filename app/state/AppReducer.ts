import { AppState, PropertyName, PropertySettingsRow } from '@/app/types'
import {
  PropertySettingsWithDetails,
  deletePreset,
} from '@/lib/services/propertySettingsService'
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
  isFactoryResetting: false,
  isUserSettingsChanging: false,
  isPresetLoading: false,
  isGroupedByStatus: false,
  isGroupedByType: false,
  isLightMode: false,
  presets: [],
  propertySettings: {},
  selectedNodePluginData: [],
  ignoreRealtimeUntil: undefined,
}

export const TABLE_HANDLERS = {
  presets: {
    path: 'presets',
    handleDelete: (state: AppState, oldData: any) => ({
      presets: filter(state.presets, (preset) => preset.id !== oldData.id),
    }),
    handleUpsert: (state: AppState, newData: any) => {
      const existingIndex = findIndex(
        state.presets,
        (preset) => preset.id === newData.id,
      )

      const newPresets = [...state.presets]
      if (existingIndex >= 0) {
        newPresets[existingIndex] = {
          id: newData.id,
          label: newData.label,
          figma_user_id: newData.figma_user_id,
          visibility: newData.visibility || 'private',
        }
      } else {
        newPresets.push({
          id: newData.id,
          label: newData.label,
          figma_user_id: newData.figma_user_id,
          visibility: newData.visibility || 'private',
        })
      }

      return { presets: newPresets }
    },
  },
  property_settings: {
    path: 'propertySettings',
    handleDelete: (state: AppState, oldData: any) => ({
      propertySettings: omit(state.propertySettings, [oldData.label]),
    }),
    handleUpsert: (state: AppState, newData: any, event?: 'INSERT' | 'UPDATE') => {
      // Property settings are stored by label in state, not by id
      // The real-time payload should include the label field
      if (newData.label && state.propertySettings[newData.label]) {
        const existing = state.propertySettings[newData.label]

        // For INSERT events: if the property setting already exists in state with complete data
        // (has related tables), ignore the INSERT to avoid overwriting complete data with partial data.
        // This prevents Factory Reset from being overwritten by realtime INSERT events.
        // Note: INSERT events from Supabase only include the base table columns, not related tables.
        if (event === 'INSERT') {
          const existingHasRelatedData =
            existing.text_property_settings ||
            existing.dimension_property_settings ||
            existing.numeric_property_settings ||
            existing.list_property_settings

          // INSERT events from property_settings table won't include related tables in the payload
          // If existing data already has complete information (from setInitialData), ignore the INSERT
          if (existingHasRelatedData) {
            console.log('Ignoring INSERT event for property setting with existing complete data:', {
              label: newData.label,
              existingPresetId: existing.preset_id,
              newPresetId: newData.preset_id,
            })
            return { propertySettings: state.propertySettings }
          }
        }

        // Update the existing property setting by merging the new data
        // CRITICAL: Always preserve id and preset_id from existing state - these belong to the local preset
        // and should NEVER be overwritten by realtime events (which might have wrong IDs from other presets)
        const { id: existingId, preset_id: existingPresetId } = existing
        return {
          propertySettings: {
            ...state.propertySettings,
            [newData.label]: {
              ...existing,
              ...newData,
              // Always preserve id and preset_id from existing state (local preset)
              id: existingId,
              preset_id: existingPresetId,
              // Preserve detail settings that might not be in the payload
              text_property_settings: newData.text_property_settings ?? existing.text_property_settings,
              dimension_property_settings: newData.dimension_property_settings ?? existing.dimension_property_settings,
              numeric_property_settings: newData.numeric_property_settings ?? existing.numeric_property_settings,
              list_property_settings: newData.list_property_settings ?? existing.list_property_settings,
            },
          },
        }
      }

      // If label not found, return unchanged (property setting might not be loaded yet)
      return { propertySettings: state.propertySettings }
    },
  },
  numeric_property_settings: {
    path: 'propertySettings',
    handleDelete: (state: AppState, oldData: any) => {
      // Find property setting by label and remove numeric_property_settings
      if (oldData.label && state.propertySettings[oldData.label]) {
        const existing = state.propertySettings[oldData.label]
        const { min, max, operator, ...rest } = existing
        return {
          propertySettings: {
            ...state.propertySettings,
            [oldData.label]: rest,
          },
        }
      }
      return { propertySettings: state.propertySettings }
    },
    handleUpsert: (state: AppState, newData: any) => {
      // Update the merged min/max/operator values in the property setting
      if (newData.label && state.propertySettings[newData.label]) {
        const existing = state.propertySettings[newData.label]

        // Only update fields that are actually present in newData (not null/undefined)
        // This handles partial updates from realtime subscriptions
        // Note: 0 is a valid value, so we check for != null (not falsy)
        const updatedMin = 'min' in newData && newData.min !== null && newData.min !== undefined ? newData.min : existing.min
        const updatedMax = 'max' in newData && newData.max !== null && newData.max !== undefined ? newData.max : existing.max
        const updatedOperator = 'operator' in newData && newData.operator !== null && newData.operator !== undefined ? newData.operator : existing.operator

        console.log('Updating numeric_property_settings:', {
          label: newData.label,
          newData,
          existingMin: existing.min,
          existingMax: existing.max,
          updatedMin,
          updatedMax,
        })

        return {
          propertySettings: {
            ...state.propertySettings,
            [newData.label]: {
              ...existing,
              // Merge numeric_property_settings fields directly into the property setting
              min: updatedMin,
              max: updatedMax,
              operator: updatedOperator,
              // Update numeric_property_settings object if it exists
              numeric_property_settings: existing.numeric_property_settings
                ? {
                    ...existing.numeric_property_settings,
                    min: updatedMin,
                    max: updatedMax,
                    operator: updatedOperator,
                  }
                : {
                    ...newData,
                    min: updatedMin,
                    max: updatedMax,
                    operator: updatedOperator,
                  },
            },
          },
        }
      }

      return { propertySettings: state.propertySettings }
    },
  },
  text_property_settings: {
    path: 'propertySettings',
    handleDelete: (state: AppState, oldData: any) => {
      // Find property setting by label and remove text_property_settings
      if (oldData.label && state.propertySettings[oldData.label]) {
        const existing = state.propertySettings[oldData.label]
        const {
          decimal_places,
          prefix,
          suffix,
          thousands_separator,
          ...rest
        } = existing
        return {
          propertySettings: {
            ...state.propertySettings,
            [oldData.label]: rest,
          },
        }
      }
      return { propertySettings: state.propertySettings }
    },
    handleUpsert: (state: AppState, newData: any) => {
      // Update the merged text property settings fields in the property setting
      if (newData.label && state.propertySettings[newData.label]) {
        const existing = state.propertySettings[newData.label]
        return {
          propertySettings: {
            ...state.propertySettings,
            [newData.label]: {
              ...existing,
              // Merge text_property_settings fields directly into the property setting
              decimal_places:
                newData.decimal_places ?? existing.decimal_places,
              prefix: newData.prefix ?? existing.prefix,
              suffix: newData.suffix ?? existing.suffix,
              thousands_separator:
                newData.thousands_separator ?? existing.thousands_separator,
              // Update text_property_settings object if it exists
              text_property_settings: existing.text_property_settings
                ? {
                    ...existing.text_property_settings,
                    decimal_places:
                      newData.decimal_places ??
                      existing.text_property_settings.decimal_places,
                    prefix:
                      newData.prefix ?? existing.text_property_settings.prefix,
                    suffix:
                      newData.suffix ?? existing.text_property_settings.suffix,
                    thousands_separator:
                      newData.thousands_separator ??
                      existing.text_property_settings.thousands_separator,
                  }
                : newData,
            },
          },
        }
      }

      return { propertySettings: state.propertySettings }
    },
  },
  dimension_property_settings: {
    path: 'propertySettings',
    handleDelete: (state: AppState, oldData: any) => {
      // Find property setting by label and remove dimension_property_settings
      if (oldData.label && state.propertySettings[oldData.label]) {
        const existing = state.propertySettings[oldData.label]
        const {
          anchor_position,
          dimension,
          preserve_aspect_ratio,
          ...rest
        } = existing
        return {
          propertySettings: {
            ...state.propertySettings,
            [oldData.label]: rest,
          },
        }
      }
      return { propertySettings: state.propertySettings }
    },
    handleUpsert: (state: AppState, newData: any) => {
      // Update the merged dimension property settings fields in the property setting
      if (newData.label && state.propertySettings[newData.label]) {
        const existing = state.propertySettings[newData.label]
        return {
          propertySettings: {
            ...state.propertySettings,
            [newData.label]: {
              ...existing,
              // Merge dimension_property_settings fields directly into the property setting
              anchor_position:
                newData.anchor_position ?? existing.anchor_position,
              dimension: newData.dimension ?? existing.dimension,
              preserve_aspect_ratio:
                newData.preserve_aspect_ratio ?? existing.preserve_aspect_ratio,
              // Update dimension_property_settings object if it exists
              dimension_property_settings: existing.dimension_property_settings
                ? {
                    ...existing.dimension_property_settings,
                    anchor_position:
                      newData.anchor_position ??
                      existing.dimension_property_settings.anchor_position,
                    dimension:
                      newData.dimension ??
                      existing.dimension_property_settings.dimension,
                    preserve_aspect_ratio:
                      newData.preserve_aspect_ratio ??
                      existing.dimension_property_settings.preserve_aspect_ratio,
                  }
                : newData,
            },
          },
        }
      }

      return { propertySettings: state.propertySettings }
    },
  },
  list_property_settings: {
    path: 'propertySettings',
    handleDelete: (state: AppState, oldData: any) => {
      // Find property setting by label and remove list_property_settings
      if (oldData.label && state.propertySettings[oldData.label]) {
        const existing = state.propertySettings[oldData.label]
        const { modeOptions, ...rest } = existing
        return {
          propertySettings: {
            ...state.propertySettings,
            [oldData.label]: rest,
          },
        }
      }
      return { propertySettings: state.propertySettings }
    },
    handleUpsert: (state: AppState, newData: any) => {
      // Update the merged list property settings fields in the property setting
      if (newData.label && state.propertySettings[newData.label]) {
        const existing = state.propertySettings[newData.label]
        const optionsString = typeof newData.options === 'string' ? newData.options : ''
        const optionsArray = optionsString.split('\n').filter(line => line.trim() !== '')
        return {
          propertySettings: {
            ...state.propertySettings,
            [newData.label]: {
              ...existing,
              // Merge list_property_settings fields directly into the property setting
              modeOptions: {
                list: {
                  options: optionsArray,
                },
              },
              // Update list_property_settings object if it exists
              list_property_settings: existing.list_property_settings
                ? {
                    ...existing.list_property_settings,
                    options: optionsString,
                  }
                : newData,
            },
          },
        }
      }

      return { propertySettings: state.propertySettings }
    },
  },
  user_options: {
    path: 'userOptions',
    handleDelete: () => {
      // User options shouldn't be deleted, but if they are, reset to defaults
      return {
        isAutoScrollEnabled: false,
        isGroupedByStatus: false,
        isGroupedByType: false,
        isLightMode: false,
      }
    },
    handleUpsert: (state: AppState, newData: any) => {
      return {
        isAutoScrollEnabled: newData.is_auto_scroll_enabled ?? state.isAutoScrollEnabled,
        isGroupedByStatus: newData.is_grouped_by_status ?? state.isGroupedByStatus,
        isGroupedByType: newData.is_grouped_by_type ?? state.isGroupedByType,
        isLightMode: newData.is_light_mode ?? state.isLightMode,
      }
    },
  },
} as const

export type AppAction =
  | {
      type: 'setSelectedNodePluginData'
      payload: {
        partialPropertySettings: Partial<PropertySettingsRow>[]
      }
    }
  | {
    type: 'setInitialData'
    payload: {
      propertySettings: PropertySettingsWithDetails[]
      presets: any[]
      currentUserId: string | null
      userOptions?: {
        isAutoScrollEnabled: boolean
        isGroupedByStatus: boolean
        isGroupedByType: boolean
        isLightMode: boolean
      }
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
        id?: string
        label: string
        propertySettings: Partial<PropertySettingsRow>
      }
    }
  | {
      type: 'deletePreset'
      payload: {
        id: string
      }
    }
  | {
      type: 'loadPreset'
      payload: {
        presetPropertySettings: PropertySettingsWithDetails[]
      }
    }
  | {
    type: 'setIgnoreRealtimeUntil'
    payload: {
      timestamp: number
    }
  }
  | {
    type: 'setFactoryResetting'
    payload: {
      isResetting: boolean
    }
  }
  | {
    type: 'setUserSettingsChanging'
    payload: {
      isChanging: boolean
    }
  }
  | {
    type: 'setPresetLoading'
    payload: {
      isLoading: boolean
    }
  }
  | {
    type: 'setPresets'
    payload: {
      presets: Array<{ id: string; label: string; figma_user_id: string; visibility: 'private' | 'public' }>
    }
  }

export const AppReducer = (state: AppState, action: AppAction) => {
  if (typeof action === 'undefined') {
    return state
  }

  const newState = produce(state, (draft) => {
    switch (action.type) {
      case 'setInitialData': {
        const { propertySettings, presets, currentUserId, userOptions } = action.payload

        // Only update currentUserId if the new value is not null
        // This prevents overwriting a valid user ID with null
        if (currentUserId !== null) {
          draft.currentUserId = currentUserId
        } else if (draft.currentUserId === null) {
          // Only set to null if it's already null (don't overwrite existing value)
          draft.currentUserId = null
        }

        // Update user options if provided
        if (userOptions) {
          draft.isAutoScrollEnabled = userOptions.isAutoScrollEnabled
          draft.isGroupedByStatus = userOptions.isGroupedByStatus
          draft.isGroupedByType = userOptions.isGroupedByType
          draft.isLightMode = userOptions.isLightMode
        }

        const propertySettingsMap = propertySettings.reduce((acc, ps) => {
          acc[ps.label] = ps
          return acc
        }, {} as Record<string, PropertySettingsWithDetails>)

        // Log the opacity setting before and after update
        const opacityBefore = draft.propertySettings['opacity']?.is_enabled
        const opacityAfter = propertySettingsMap['opacity']?.is_enabled
        const opacityBeforeId = draft.propertySettings['opacity']?.id
        const opacityAfterId = propertySettingsMap['opacity']?.id
        const opacityBeforePresetId = draft.propertySettings['opacity']?.preset_id
        const opacityAfterPresetId = propertySettingsMap['opacity']?.preset_id
        console.log('setInitialData - updating propertySettings:', {
          currentUserId,
          opacityBefore,
          opacityAfter,
          opacityBeforeId,
          opacityAfterId,
          opacityBeforePresetId,
          opacityAfterPresetId,
          opacitySetting: propertySettingsMap['opacity'],
          totalSettings: Object.keys(propertySettingsMap).length,
          allPresetIds: Object.values(propertySettingsMap).map(ps => ({ label: ps.label, id: ps.id, preset_id: ps.preset_id })).slice(0, 5),
        })

        draft.propertySettings = propertySettingsMap
        draft.presets = presets.map((preset) => ({
          id: preset.id,
          label: preset.label,
          figma_user_id: preset.figma_user_id,
          visibility: preset.visibility || 'private',
        }))

        // Clear the ignore realtime flag after setting initial data
        draft.ignoreRealtimeUntil = undefined
        break
      }

      case 'handleDatabaseChange': {
        // Ignore realtime events if we're in the middle of a Factory Reset
        if (state.ignoreRealtimeUntil && Date.now() < state.ignoreRealtimeUntil) {
          console.log('Ignoring realtime event during Factory Reset:', {
            table: action.payload.table,
            event: action.payload.event,
            ignoreUntil: state.ignoreRealtimeUntil,
            now: Date.now(),
          })
          return
        }

        const { table, event, new: newData, old: oldData } = action.payload
        const handler = TABLE_HANDLERS[table]

        if (!handler) {
          console.warn(`No handler found for table: ${table}`)
          return
        }

        const updates =
          event === 'DELETE'
            ? handler.handleDelete(state, oldData)
            : handler.handleUpsert(state, newData, event)

        // For user_options, update the state fields directly
        if (table === 'user_options' && updates) {
          if ('isAutoScrollEnabled' in updates) {
            draft.isAutoScrollEnabled = updates.isAutoScrollEnabled
          }
          if ('isGroupedByStatus' in updates) {
            draft.isGroupedByStatus = updates.isGroupedByStatus
          }
          if ('isGroupedByType' in updates) {
            draft.isGroupedByType = updates.isGroupedByType
          }
          if ('isLightMode' in updates) {
            draft.isLightMode = updates.isLightMode
          }
        } else {
          mapValues(updates, (value, key) => {
            set(draft, key, value)
          })
        }
        break
      }

      case 'setSelectedNodePluginData': {
        const { partialPropertySettings } = action.payload

        draft.selectedNodePluginData = partialPropertySettings
        break
      }

      case 'upsertPreset': {
        // This action is handled in Toolbar.tsx via createPreset/updatePreset
        // No reducer action needed as presets are managed via database changes
        console.log('upsertPreset action received - handled in component')
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

      case 'loadPreset': {
        const { presetPropertySettings } = action.payload

        // 1. Disable all properties
        Object.values(draft.propertySettings).forEach((ps) => {
          ps.is_enabled = false
        })

        // 2. Merge preset settings by label into local preset
        // IMPORTANT: Update id and preset_id to match the local preset's IDs
        // (presetPropertySettings should already have the correct IDs from the local preset after updatePreset)
        presetPropertySettings.forEach((presetPs) => {
          const label = presetPs.label
          if (draft.propertySettings[label]) {
            const localPs = draft.propertySettings[label]
            // Copy all fields including id and preset_id (these should be from the local preset now)
            Object.assign(localPs, presetPs)
          }
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

      case 'setIgnoreRealtimeUntil': {
        const { timestamp } = action.payload
        draft.ignoreRealtimeUntil = timestamp
        break
      }

      case 'setFactoryResetting': {
        const { isResetting } = action.payload
        draft.isFactoryResetting = isResetting
        break
      }

      case 'setUserSettingsChanging': {
        const { isChanging } = action.payload
        draft.isUserSettingsChanging = isChanging
        break
      }

      case 'setPresetLoading': {
        const { isLoading } = action.payload
        draft.isPresetLoading = isLoading
        break
      }

      case 'setPresets': {
        draft.presets = action.payload.presets
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
