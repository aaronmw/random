import { AppAction, AppState } from '@/lib/types'
import isEqual from 'lodash/isEqual'
import mapValues from 'lodash/mapValues'
import set from 'lodash/set'
import { getSideEffectsForPreservingAspectRatio } from './state-constraints/getSideEffectsForPreservingAspectRatio'

export { AppReducer }

const AppReducer = (state: AppState, action: AppAction) => {
  let newState: AppState = structuredClone(state)

  if (typeof action === 'undefined') {
    return state
  }

  switch (action.type) {
    case 'loadPropertySettings': {
      const { loadedProperties } = action.payload

      newState = {
        ...newState,
        propertySettings: {
          ...mapValues(newState.propertySettings, (propertySetting) => ({
            ...propertySetting,
            disabled: false,
          })),
          ...loadedProperties,
        },
      }
      break
    }

    case 'setPreserveAspectRatio': {
      const { preserveAspectRatio, propertyName } = action.payload

      const sideEffects = getSideEffectsForPreservingAspectRatio({
        preserveAspectRatio,
        propertyName,
        state: newState,
      })

      newState = set(
        newState,
        `${propertyName}.preserveAspectRatio`,
        preserveAspectRatio,
      )

      sideEffects.forEach(([path, value]) => {
        set(newState, path, value)
      })

      break
    }

    case 'setStateByPath': {
      const { path, value } = action.payload
      set(newState, path, value)
      break
    }

    case 'setSelectionCount': {
      const { count } = action.payload
      newState.selectionCount = count
      break
    }
  }

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

export const initialState = {
  selectionCount: 0,
  // ... existing state
}
