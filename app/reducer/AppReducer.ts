import { AppAction, AppState, PropertyName } from "@/lib/types"
import update from "immutability-helper"
import { isEqual, mapValues, set } from "lodash"
import { getSideEffectsForEnablingRandomization } from "./state-constraints/getSideEffectsForEnablingRandomization"
import { getSideEffectsForPreservingAspectRatio } from "./state-constraints/getSideEffectsForPreservingAspectRatio"

export { AppReducer }

const AppReducer = (state: AppState, action: AppAction) => {
  let newState: AppState = structuredClone(state)

  if (typeof action === "undefined") {
    return state
  }

  switch (action.type) {
    case "loadPropertySettings": {
      const { loadedProperties } = action.payload

      newState = {
        ...newState,
        propertySettings: {
          ...mapValues(newState.propertySettings, (propertySetting) => ({
            ...propertySetting,
            mode: "disabled" as const,
          })),
          ...loadedProperties,
        },
      }
      break
    }

    case "setPreserveAspectRatio": {
      const { preserveAspectRatio, propertyName } = action.payload

      const sideEffects = getSideEffectsForPreservingAspectRatio({
        preserveAspectRatio,
        propertyName,
        state: newState,
      })

      newState = update(newState, {
        propertySettings: {
          [propertyName]: {
            preserveAspectRatio: {
              $set: preserveAspectRatio,
            },
          },
          ...sideEffects,
        },
      })
      break
    }

    case "setStateByPath": {
      const { path, value } = action.payload
      set(newState, path, value)
      break
    }
  }

  const stateHasChanged = !isEqual(state, newState)

  console.log(
    `App action ${action.type} fired${!stateHasChanged ? ", but no state change" : ""}:`,
    {
      action,
      prevState: state,
      newState,
    },
  )

  return stateHasChanged ? newState : state
}
